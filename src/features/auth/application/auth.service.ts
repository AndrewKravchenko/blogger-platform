import { Injectable } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { Request } from 'express'
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository'
import bcrypt from 'bcrypt'
import { SessionsRepository } from '../../sessions/infrastructure/sessions.repository'
import { JwtService } from '@nestjs/jwt'
import { InterlayerResult, InterlayerResultCode } from '../../../common/models/result-layer.model'
import { v4 as uuidv4 } from 'uuid'
import { convertUnixTimestampToISO } from '../../../infrastructure/utils/common'
import { Session } from '../../sessions/domain/session.entity'
import { MeOutputModel } from '../../users/api/models/output/user.output.model'
import { UsersService } from '../../users/application/users.service'
import { SignUpUserInputModel } from '../api/models/input/create-auth.input.model'
import { PasswordRecovery, User } from '../../users/domain/user.entity'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { add } from 'date-fns'
import { NewPasswordRecoveryInputModel } from '../api/models/input/auth.input.model'
import { RefreshedSession } from '../../sessions/application/sessions.service'
import { ConfigService } from '@nestjs/config'
import { Configuration } from '../../../settings/configuration'
import { EmailsService } from '../../../infrastructure/emails/application/emails.service'

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type JwtPayload = {
  [key: string]: any
  iss?: string
  sub?: string
  userId: string
  deviceId?: string
  exp: number
  iat: number
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string

  constructor(
    private readonly configService: ConfigService<Configuration, true>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly emailsService: EmailsService,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly sessionsRepository: SessionsRepository,
  ) {
    this.jwtSecret = this.getJwtSecret()
  }

  async getMe(userId: string): Promise<InterlayerResult<MeOutputModel | null>> {
    const user = await this.usersQueryRepository.getMe(userId)
    if (user) {
      return InterlayerResult.Ok(user)
    } else {
      return InterlayerResult.Error(InterlayerResultCode.Unauthorized)
    }
  }

  async signUp(userInputModel: SignUpUserInputModel): Promise<InterlayerResult> {
    const { login, password, email } = userInputModel
    const existingUser = await this.usersQueryRepository.getUserByLoginOrEmail(login, email)

    if (existingUser) {
      const incorrectField = existingUser.login === login ? 'login' : 'email'

      return InterlayerResult.Error(
        InterlayerResultCode.BadRequest,
        `Incorrect ${incorrectField}!`,
        `${incorrectField}`,
      )
    }

    const confirmationCode = uuidv4()
    const { passwordSalt, passwordHash } = await this.usersService.generatePasswordHash(password)

    const newUser = new User({
      login,
      email,
      password: passwordHash,
      passwordSalt,
      isDeleted: false,
      emailConfirmation: {
        isConfirmed: false,
        confirmationCode,
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 1,
        }),
      },
    })

    await this.usersRepository.create(newUser)
    await this.emailsService.sendRegistrationConfirmationEmail(email, confirmationCode)

    return InterlayerResult.Ok()
  }

  async confirmEmail(code: string): Promise<InterlayerResult> {
    const user = await this.usersRepository.getUserByConfirmationCode(code)
    const incorrectCodeError = InterlayerResult.Error(InterlayerResultCode.BadRequest, 'Incorrect code!', 'code')

    if (!user?.emailConfirmation) {
      return incorrectCodeError
    }

    const isCorrectCode = user.emailConfirmation.confirmationCode === code
    const isExpired = user.emailConfirmation.expirationDate < new Date()

    if (isCorrectCode && !isExpired) {
      await this.usersRepository.markEmailConfirmed(user.id)
      return InterlayerResult.Ok()
    }

    return incorrectCodeError
  }

  async resendRegistrationEmail(email: string): Promise<InterlayerResult> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email)

    if (!user?.emailConfirmation) {
      return InterlayerResult.Error(InterlayerResultCode.BadRequest, 'Incorrect email!', 'email')
    }

    const confirmationCode = uuidv4()

    await this.usersRepository.changeEmailConfirmationCode(user.id, confirmationCode)
    await this.emailsService.sendRegistrationConfirmationEmail(email, confirmationCode)

    return InterlayerResult.Ok()
  }

  async resetPassword(email: string): Promise<InterlayerResult> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email)

    if (!user) {
      return InterlayerResult.Ok()
    }

    const code = uuidv4()
    const expirationDate = add(new Date(), { hours: 1, minutes: 1 })
    const passwordRecovery = new PasswordRecovery(code, expirationDate)

    await this.usersRepository.createRecoveryCode(user.id, passwordRecovery)
    await this.emailsService.sendPasswordRecoveryEmail(email, code)

    return InterlayerResult.Ok()
  }

  async changePassword({ newPassword, recoveryCode }: NewPasswordRecoveryInputModel): Promise<InterlayerResult> {
    const user = await this.usersRepository.getUserByPasswordRecoveryCode(recoveryCode)

    if (!user?.passwordRecovery) {
      return InterlayerResult.Error(InterlayerResultCode.BadRequest)
    }

    const isExpired = user.passwordRecovery.expirationDate < new Date()

    if (isExpired) {
      return InterlayerResult.Error(InterlayerResultCode.BadRequest)
    }

    const passwordData = await this.usersService.generatePasswordHash(newPassword)
    await this.usersRepository.changePassword(user.id, passwordData)

    return InterlayerResult.Ok()
  }

  async login(userId: string, ip = '', deviceName = ''): Promise<InterlayerResult<TokenPair>> {
    const sessionsCount = await this.sessionsRepository.getUserSessionsCount(userId)

    if (sessionsCount > 5) {
      await this.sessionsRepository.deleteOldestSession(userId)
    }

    const payload = { userId }
    const { accessToken, refreshToken } = this.signTokens(payload)
    const { iat, exp, deviceId } = this.jwtService.decode(refreshToken)

    const newSession = new Session({
      ip,
      deviceId,
      userId,
      deviceName,
      lastActiveDate: convertUnixTimestampToISO(iat),
      expirationAt: convertUnixTimestampToISO(exp),
    })

    await this.sessionsRepository.createSession(newSession)

    return InterlayerResult.Ok({ accessToken, refreshToken })
  }

  async refreshAccessToken(userId: string, deviceId: string, ip = ''): Promise<InterlayerResult<TokenPair>> {
    const payload = { userId }
    const { accessToken, refreshToken } = this.signTokens(payload, deviceId)
    const { iat, exp } = this.jwtService.decode(refreshToken)

    const refreshedSession: RefreshedSession = {
      ip,
      expirationAt: convertUnixTimestampToISO(exp),
      lastActiveDate: convertUnixTimestampToISO(iat),
    }
    await this.sessionsRepository.refreshSession(userId, deviceId, refreshedSession)

    return InterlayerResult.Ok({ accessToken, refreshToken })
  }

  async logout(deviceId: string): Promise<void> {
    await this.sessionsRepository.deleteSessionByDeviceId(deviceId)
  }

  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(loginOrEmail)

    if (!user) {
      return null
    }

    const passwordHash = await this._generateHash(password, user.passwordSalt)

    if (user.password === passwordHash) {
      return user
    }

    return null
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.verify<JwtPayload>(token, { secret: this.jwtSecret })
    } catch (e) {
      return null
    }
  }

  decodeUserIdFromToken(req: Request): string | null {
    const auth = req.headers['authorization']

    if (!auth) {
      return null
    }

    const token = auth.split(' ')[1]
    const { userId } = this.verifyToken(token) || {}

    if (userId && ObjectId.isValid(userId)) {
      return userId
    }

    return null
  }

  async isActiveSession(userId: string, deviceId: string, iat: number): Promise<boolean> {
    const lastActiveDate = convertUnixTimestampToISO(iat)
    const session = await this.sessionsRepository.getSession(userId, deviceId)

    return lastActiveDate === session?.lastActiveDate
  }

  private signTokens(payload: any, deviceId?: string): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: 15 * 60 * 1000,
    })

    const refreshToken = this.jwtService.sign(
      { ...payload, deviceId: deviceId || uuidv4() },
      {
        secret: this.jwtSecret,
        expiresIn: 24 * 60 * 60 * 1000,
      },
    )

    return { accessToken, refreshToken }
  }

  private async _generateHash(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }

  private getJwtSecret(): string {
    return this.configService.get('jwtSettings.JWT_SECRET', {
      infer: true,
    })
  }
}
