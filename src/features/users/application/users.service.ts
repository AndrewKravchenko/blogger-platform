import bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../infrastructure/users.repository'
import { CreateUserInputModel } from '../api/models/input/create-user-input.model'
import { User } from '../domain/user.entity'
import { UsersQueryRepository } from '../infrastructure/users.query-repository'
import { FullUserOutputModel, UserOutputModel } from '../api/models/output/user.output.model'
import { Result, ResultCode } from '../../../common/models/result-layer.model'

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

  async create(userInputModel: CreateUserInputModel): Promise<Result<UserOutputModel>> {
    const { login, password, email } = userInputModel
    const existingUser = await this.usersQueryRepository.getUserByLoginOrEmail(login, email)

    if (existingUser) {
      const incorrectField = existingUser.login === login ? 'login' : 'email'

      return {
        resultCode: ResultCode.BadRequest,
        errorMessages: [{ message: `Incorrect ${incorrectField}!`, field: `${incorrectField}` }],
      }
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

    return { resultCode: ResultCode.Success, data: createdUser }
  }

  async deleteById(userId: string): Promise<Result> {
    const isDeleted = await this.usersRepository.deleteById(userId)
    return { resultCode: isDeleted ? ResultCode.Success : ResultCode.NotFound }
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
