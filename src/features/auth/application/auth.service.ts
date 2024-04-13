import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { Request } from 'express'
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository'
import bcrypt from 'bcrypt'
import { SessionsRepository } from '../../sessions/infrastructure/sessions.repository'
import { JwtService } from '@nestjs/jwt'
import { Result, ResultCode } from '../../../common/models/result-layer.model'
import { v4 as uuidv4 } from 'uuid'
import { convertUnixTimestampToISO } from '../../../utils/common'
import { Session } from '../../sessions/domain/session.entity'
import { MeOutputModel } from '../../users/api/models/output/user.output.model'
import { UsersService } from '../../users/application/users.service'
import { SignUpUserInputModel } from '../api/models/input/create-auth.input.model'
import { PasswordRecovery, User } from '../../users/domain/user.entity'
import { UsersRepository } from '../../users/infrastructure/users.repository'
import { add } from 'date-fns'
import { EmailsService } from '../../emails/application/emails.service'
import { NewPasswordRecoveryInputModel } from '../api/models/input/auth.input.model'
import { RefreshedSession } from '../../sessions/application/sessions.service'

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
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async getMe(userId: string): Promise<Result<MeOutputModel>> {
    const user = await this.usersQueryRepository.getMe(userId)

    if (user) {
      return { resultCode: ResultCode.Success, data: user }
    } else {
      return { resultCode: ResultCode.Unauthorized }
    }
  }

  async signUp(userInputModel: SignUpUserInputModel): Promise<Result> {
    const { login, password, email } = userInputModel
    const existingUser = await this.usersQueryRepository.getUserByLoginOrEmail(login, email)

    if (existingUser) {
      const incorrectField = existingUser.login === login ? 'login' : 'email'

      return {
        resultCode: ResultCode.BadRequest,
        errorMessages: [{ message: `Incorrect ${incorrectField}!`, field: `${incorrectField}` }],
      }
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

    return { resultCode: ResultCode.Success }
  }

  async confirmEmail(code: string): Promise<Result> {
    const errorMessages = [{ message: 'Incorrect code!', field: 'code' }]
    const user = await this.usersRepository.getUserByConfirmationCode(code)

    if (!user?.emailConfirmation) {
      return { resultCode: ResultCode.BadRequest, errorMessages }
    }

    const isCorrectCode = user.emailConfirmation.confirmationCode === code
    const isExpired = user.emailConfirmation.expirationDate < new Date()

    if (isCorrectCode && !isExpired) {
      await this.usersRepository.markEmailConfirmed(user.id)
      return { resultCode: ResultCode.Success }
    }

    return { resultCode: ResultCode.BadRequest, errorMessages }
  }

  async resendRegistrationEmail(email: string): Promise<Result> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email)

    if (!user?.emailConfirmation) {
      return { resultCode: ResultCode.BadRequest, errorMessages: [{ message: 'Incorrect email!', field: 'email' }] }
    }

    const confirmationCode = uuidv4()

    await this.usersRepository.changeEmailConfirmationCode(user.id, confirmationCode)
    await this.emailsService.sendRegistrationConfirmationEmail(email, confirmationCode)

    return { resultCode: ResultCode.Success }
  }

  async resetPassword(email: string): Promise<Result> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(email)

    if (!user) {
      return { resultCode: ResultCode.Success }
    }

    const code = uuidv4()
    const expirationDate = add(new Date(), { hours: 1, minutes: 1 })
    const passwordRecovery = new PasswordRecovery(code, expirationDate)

    await this.usersRepository.createRecoveryCode(user.id, passwordRecovery)
    await this.emailsService.sendPasswordRecoveryEmail(email, code)

    return { resultCode: ResultCode.Success }
  }

  async changePassword({ newPassword, recoveryCode }: NewPasswordRecoveryInputModel): Promise<Result> {
    const user = await this.usersRepository.getUserByPasswordRecoveryCode(recoveryCode)

    if (!user?.passwordRecovery) {
      return { resultCode: ResultCode.BadRequest }
    }

    const isExpired = user.passwordRecovery.expirationDate < new Date()

    if (isExpired) {
      return { resultCode: ResultCode.BadRequest }
    }

    const passwordData = await this.usersService.generatePasswordHash(newPassword)
    await this.usersRepository.changePassword(user.id, passwordData)

    return { resultCode: ResultCode.Success }
  }

  async login(userId: string, ip = '', deviceName = ''): Promise<Result<TokenPair>> {
    const sessionsCount = await this.sessionsRepository.getUserSessionsCount(userId)

    if (sessionsCount > 5) {
      await this.sessionsRepository.deleteOldestSession(userId)
    }

    const payload = { userId }
    const { accessToken, refreshToken } = this.createTokens(payload)
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

    return {
      resultCode: ResultCode.Success,
      data: { accessToken, refreshToken },
    }
  }

  async refreshAccessToken(userId: string, deviceId: string, ip = ''): Promise<Result<TokenPair>> {
    const payload = { userId }
    const { accessToken, refreshToken } = this.createTokens(payload, deviceId)
    const { iat, exp } = this.jwtService.decode(refreshToken)

    const refreshedSession: RefreshedSession = {
      ip,
      expirationAt: convertUnixTimestampToISO(exp),
      lastActiveDate: convertUnixTimestampToISO(iat),
    }
    await this.sessionsRepository.refreshSession(userId, deviceId, refreshedSession)

    return {
      resultCode: ResultCode.Success,
      data: { accessToken, refreshToken },
    }
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

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token, { secret: process.env.JWT_SECRET })
    } catch (e) {
      throw new UnauthorizedException()
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

  private createTokens(payload: any, deviceId?: string): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: 15 * 60 * 1000,
    })

    const refreshToken = this.jwtService.sign(
      { ...payload, deviceId: deviceId || uuidv4() },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: 24 * 60 * 60 * 1000,
      },
    )

    return { accessToken, refreshToken }
  }

  private async _generateHash(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
