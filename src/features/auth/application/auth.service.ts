import { Injectable } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { Request } from 'express'
import bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { InterlayerResult, InterlayerResultCode } from '../../../common/models/result-layer.model'
import { v4 as uuidv4 } from 'uuid'
import { Session } from '../../sessions/domain/session.sql-entity'
import { MeOutputModel } from '../../users/api/models/output/user.output.model'
import { UsersService } from '../../users/application/users.service'
import { SignUpUserInputModel } from '../api/models/input/create-auth.input.model'
import { add } from 'date-fns'
import { NewPasswordRecoveryInputModel } from '../api/models/input/auth.input.model'
import { RefreshedSession } from '../../sessions/application/sessions.service'
import { ConfigService } from '@nestjs/config'
import { Configuration } from '../../../settings/configuration'
import { EmailsService } from '../../../infrastructure/emails/application/emails.service'
import { UsersSqlRepository } from '../../users/infrastructure/users.sql-repository'
import { UsersSqlQueryRepository } from '../../users/infrastructure/users.sql-query-repository'
import { SessionsSqlRepository } from '../../sessions/infrastructure/sessions.sql-repository'
import { SessionOutputModel } from '../../sessions/api/models/output/session.output.model'
import { User } from '../../users/domain/user.sql-entity'

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
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService<Configuration, true>,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly sessionsSqlRepository: SessionsSqlRepository,
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  async getMe(userId: string): Promise<InterlayerResult<MeOutputModel | null>> {
    const user = await this.usersSqlQueryRepository.getMe(userId)
    if (user) {
      return InterlayerResult.Ok(user)
    } else {
      return InterlayerResult.Error(InterlayerResultCode.Unauthorized)
    }
  }

  async signUp(userInputModel: SignUpUserInputModel): Promise<InterlayerResult> {
    const { login, password, email } = userInputModel
    const existingUser = await this.usersSqlQueryRepository.getUserByLoginOrEmail(login, email)

    if (existingUser) {
      const incorrectField = existingUser.login === login ? 'login' : 'email'

      return InterlayerResult.Error(
        InterlayerResultCode.BadRequest,
        `${incorrectField}`,
        `Incorrect ${incorrectField}!`,
      )
    }

    const { passwordSalt, passwordHash } = await this.usersService.generatePasswordHash(password)

    const confirmationCode = uuidv4()
    const expirationDate = add(new Date(), { hours: 1, minutes: 1 })
    const newUser = new User({
      login,
      email,
      password: passwordHash,
      passwordSalt,
      isDeleted: false,
      isConfirmed: false,
    })

    const createdUser = await this.usersSqlRepository.create(newUser)
    await this.usersSqlRepository.createEmailConfirmation(createdUser.id, confirmationCode, expirationDate)
    await this.emailsService.sendRegistrationConfirmationEmail(email, confirmationCode)

    return InterlayerResult.Ok()
  }

  async confirmEmail(code: string): Promise<InterlayerResult> {
    const emailConfirmation = await this.usersSqlRepository.getEmailConfirmation(code)
    const incorrectCodeError = InterlayerResult.Error(InterlayerResultCode.BadRequest, 'code', 'Incorrect code!')

    if (!emailConfirmation || emailConfirmation.isConfirmed) {
      return incorrectCodeError
    }

    const isCorrectCode = emailConfirmation.confirmationCode === code
    const isExpired = emailConfirmation.expirationDate < new Date()

    if (isCorrectCode && !isExpired) {
      await this.usersSqlRepository.markEmailConfirmed(emailConfirmation.userId)
      return InterlayerResult.Ok()
    }

    return incorrectCodeError
  }

  async resendRegistrationEmail(email: string): Promise<InterlayerResult> {
    const user = await this.usersSqlRepository.getUserByLoginOrEmail(email)

    if (!user || user.isConfirmed) {
      return InterlayerResult.Error(InterlayerResultCode.BadRequest, 'email', 'Incorrect email!')
    }

    const confirmationCode = uuidv4()

    await this.usersSqlRepository.changeEmailConfirmationCode(user.id, confirmationCode)
    await this.emailsService.sendRegistrationConfirmationEmail(email, confirmationCode)

    return InterlayerResult.Ok()
  }

  async resetPassword(email: string): Promise<InterlayerResult> {
    const user = await this.usersSqlRepository.getUserByLoginOrEmail(email)

    if (!user) {
      return InterlayerResult.Ok()
    }

    const code = uuidv4()
    const expirationDate = add(new Date(), { hours: 1, minutes: 1 })
    const hasPasswordRecoveryTable = await this.usersSqlRepository.getPasswordRecoveryById(user.id)

    hasPasswordRecoveryTable
      ? await this.usersSqlRepository.updateRecoveryCode(user.id, code, expirationDate)
      : await this.usersSqlRepository.createPasswordRecovery(user.id, code, expirationDate)

    await this.emailsService.sendPasswordRecoveryEmail(email, code)

    return InterlayerResult.Ok()
  }

  async changePassword({ newPassword, recoveryCode }: NewPasswordRecoveryInputModel): Promise<InterlayerResult> {
    const passwordRecovery = await this.usersSqlRepository.getPasswordRecoveryByCode(recoveryCode)

    if (!passwordRecovery) {
      return InterlayerResult.Error(InterlayerResultCode.BadRequest)
    }

    const isExpired = passwordRecovery.expirationDate < new Date()
    if (isExpired) {
      return InterlayerResult.Error(InterlayerResultCode.BadRequest)
    }

    const passwordData = await this.usersService.generatePasswordHash(newPassword)
    await this.usersSqlRepository.changePassword(passwordRecovery.userId, passwordData)

    return InterlayerResult.Ok()
  }

  async login(userId: string, ip = '', deviceName = ''): Promise<InterlayerResult<TokenPair>> {
    const sessionsCount = await this.sessionsSqlRepository.getUserSessionsCount(userId)

    if (sessionsCount > 5) {
      await this.sessionsSqlRepository.deleteOldestSession(userId)
    }

    const payload = { userId }
    const { accessToken, refreshToken } = this.signTokens(payload)
    const { iat, exp, deviceId } = this.jwtService.decode(refreshToken)

    const newSession = new Session({
      ip,
      deviceId,
      userId,
      deviceName,
      lastActiveDate: new Date(iat * 1000),
      expirationAt: new Date(exp * 1000),
    })

    await this.sessionsSqlRepository.createSession(newSession)
    return InterlayerResult.Ok({ accessToken, refreshToken })
  }

  async refreshAccessToken(userId: string, deviceId: string, ip = ''): Promise<InterlayerResult<TokenPair>> {
    const payload = { userId }
    const { accessToken, refreshToken } = this.signTokens(payload, deviceId)
    const { iat, exp } = this.jwtService.decode(refreshToken)

    const refreshedSession: RefreshedSession = {
      ip,
      lastActiveDate: new Date(iat * 1000),
      expirationAt: new Date(exp * 1000),
    }
    await this.sessionsSqlRepository.refreshSession(userId, deviceId, refreshedSession)

    return InterlayerResult.Ok({ accessToken, refreshToken })
  }

  async logout(deviceId: string): Promise<void> {
    await this.sessionsSqlRepository.deleteSessionByDeviceId(deviceId)
  }

  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.usersSqlRepository.getUserByLoginOrEmail(loginOrEmail)

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
    const secret = this.configService.get('jwtSettings.JWT_SECRET', {
      infer: true,
    })

    try {
      return this.jwtService.verify<JwtPayload>(token, { secret })
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

  async getSession(userId: string, deviceId: string): Promise<SessionOutputModel | null> {
    return await this.sessionsSqlRepository.getSession(userId, deviceId)
  }

  private signTokens(payload: any, deviceId?: string): TokenPair {
    const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, JWT_SECRET } = this.configService.get('jwtSettings', {
      infer: true,
    })

    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    })

    const refreshToken = this.jwtService.sign(
      { ...payload, deviceId: deviceId || uuidv4() },
      {
        secret: JWT_SECRET,
        expiresIn: REFRESH_TOKEN_EXPIRY,
      },
    )

    return { accessToken, refreshToken }
  }

  private async _generateHash(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
