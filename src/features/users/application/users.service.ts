import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../infrastructure/users.repository'
import { CreateUserInputModel } from '../api/models/input/create-user-input.model'
import { User } from '../domain/user.entity'
import { UsersQueryRepository } from '../infrastructure/users.query-repository'
import { FullUserOutputModel, UserOutputModel } from '../api/models/output/user.output.model'
import { InterlayerResult, InterlayerResultCode } from '../../../common/models/result-layer.model'

export type PasswordHashResult = {
  passwordSalt: string
  passwordHash: string
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async validateUser(loginOrEmail: string, password: string): Promise<Nullable<FullUserOutputModel>> {
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

  async create(userInputModel: CreateUserInputModel): Promise<InterlayerResult<Nullable<UserOutputModel>>> {
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

    const { passwordSalt, passwordHash } = await this.generatePasswordHash(password)
    const newUser = new User({
      login,
      email,
      password: passwordHash,
      passwordSalt,
      isDeleted: false,
    })

    const createdUser = await this.usersRepository.create(newUser)

    return InterlayerResult.Ok(createdUser)
  }

  async deleteById(userId: string): Promise<InterlayerResult> {
    const isDeleted = await this.usersRepository.deleteById(userId)

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
