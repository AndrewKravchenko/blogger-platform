import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../infrastructure/users.repository'
import { CreateUserInputModel } from '../api/models/input/create-user.input.model'
import { User } from '../domain/user.entity'
import bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(userInputModel: CreateUserInputModel) {
    const { login, password, email } = userInputModel

    const { passwordSalt, passwordHash } = await this.generatePasswordHash(password)
    const newUser = new User({
      login,
      email,
      password: passwordHash,
      passwordSalt,
      isDeleted: false,
    })

    return await this.usersRepository.create(newUser)
  }

  async deleteById(userId: string) {
    return await this.usersRepository.deleteById(userId)
  }

  async generatePasswordHash(password: string) {
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(password, passwordSalt)

    return { passwordSalt, passwordHash }
  }

  private async _generateHash(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
