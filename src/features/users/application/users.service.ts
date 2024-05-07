import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { CreateUserInputModel } from '../api/models/input/create-user-input.model'
import { User } from '../domain/user.entity'
import { FullUserOutputModel, UserOutputModel } from '../api/models/output/user.output.model'
import { InterlayerResult, InterlayerResultCode } from '../../../common/models/result-layer.model'
import { UsersSqlRepository } from '../infrastructure/users.sql-repository'
import { UsersSqlQueryRepository } from '../infrastructure/users.sql-query-repository'

export type PasswordHashResult = {
  passwordSalt: string
  passwordHash: string
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  async validateUser(loginOrEmail: string, password: string): Promise<Nullable<FullUserOutputModel>> {
    const user = await this.usersSqlQueryRepository.getUserByLoginOrEmail(loginOrEmail)

    if (!user) {
      return null
    }

    const passwordHash = await this._generateHash(password, user.passwordSalt)

    if (user.password === passwordHash) {
      return user
    }

    return null
  }

  async create(userInputModel: CreateUserInputModel): Promise<InterlayerResult<Nullable<UserOutputModel>>> {
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

    const { passwordSalt, passwordHash } = await this.generatePasswordHash(password)
    const newUser = new User({
      login,
      email,
      password: passwordHash,
      passwordSalt,
      isConfirmed: true,
      isDeleted: false,
    })

    const createdUser = await this.usersSqlRepository.create(newUser)
    return InterlayerResult.Ok(createdUser)
  }

  async deleteById(userId: string): Promise<InterlayerResult> {
    const isDeleted = await this.usersSqlRepository.deleteById(userId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }

  async generatePasswordHash(password: string): Promise<PasswordHashResult> {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(password, passwordSalt)

    return { passwordSalt, passwordHash }
  }

  private async _generateHash(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
