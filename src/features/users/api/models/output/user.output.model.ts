import { UserDocument } from '../../../domain/user.entity'

export class UserOutputModel {
  id: string
  login: string
  email: string
  createdAt: string

  constructor(id: string, login: string, email: string, createdAt: string) {
    this.id = id
    this.login = login
    this.email = email
    this.createdAt = createdAt
  }
}

// MAPPERS

export const UserOutputMapper = (user: UserDocument): UserOutputModel => {
  return new UserOutputModel(user.id, user.login, user.email, user.createdAt)
}
