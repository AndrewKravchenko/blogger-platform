import { EmailConfirmation, PasswordRecovery, UserDocument } from '../../../domain/user.entity'
import { User } from '../../../domain/user.sql-entity'

type FullUserInput = {
  id: string
  login: string
  email: string
  password: string
  passwordSalt: string
  isDeleted: boolean
  isConfirmed: boolean
  createdAt: Date
}

export class MeOutputModel {
  constructor(
    public userId: string,
    public login: string,
    public email: string,
  ) {}
}

export class EmailConfirmationOutputModel {
  constructor(
    public userId: string,
    public confirmationCode: string,
    public expirationDate: Date,
  ) {}
}

export class EmailConfirmationWithStatusOutputModel extends EmailConfirmationOutputModel {
  constructor(
    userId: string,
    confirmationCode: string,
    expirationDate: Date,
    public isConfirmed: boolean,
  ) {
    super(userId, confirmationCode, expirationDate)
  }
}

export class PasswordRecoveryOutputModel {
  constructor(
    public userId: string,
    public code: string,
    public expirationDate: Date,
  ) {}
}

export class UserOutputModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: Date,
  ) {}
}

export class FullUserOutputModel extends UserOutputModel {
  public password: string
  public passwordSalt: string
  public isDeleted: boolean
  public isConfirmed: boolean

  constructor({ id, login, email, password, passwordSalt, isDeleted, isConfirmed, createdAt }: FullUserInput) {
    super(id, login, email, createdAt)

    this.password = password
    this.passwordSalt = passwordSalt
    this.isDeleted = isDeleted
    this.isConfirmed = isConfirmed
  }
}

// MAPPERS

export const MeOutputMapper = ({ id, login, email }: UserDocument): MeOutputModel => {
  return new MeOutputModel(id, login, email)
}

export const UserOutputMapper = ({ id, login, email, createdAt }: User): UserOutputModel => {
  return new UserOutputModel(id, login, email, createdAt)
}

export const EmailConfirmationOutputMapper = ({
  userId,
  confirmationCode,
  expirationDate,
}: EmailConfirmation): EmailConfirmationOutputModel => {
  return new EmailConfirmationOutputModel(userId, confirmationCode, expirationDate)
}

export const EmailConfirmationWithStatusOutputMapper = ({
  userId,
  confirmationCode,
  expirationDate,
  user,
}: EmailConfirmation & { user: User }): EmailConfirmationWithStatusOutputModel => {
  return new EmailConfirmationWithStatusOutputModel(userId, confirmationCode, expirationDate, user.isConfirmed)
}

export const PasswordRecoveryOutputMapper = ({
  userId,
  code,
  expirationDate,
}: PasswordRecovery): PasswordRecoveryOutputModel => {
  return new PasswordRecoveryOutputModel(userId, code, expirationDate)
}

export const FullUserOutputMapper = ({
  id,
  login,
  email,
  password,
  passwordSalt,
  isDeleted,
  isConfirmed,
  createdAt,
}: User): FullUserOutputModel => {
  return new FullUserOutputModel({
    id,
    login,
    email,
    password,
    passwordSalt,
    isDeleted,
    isConfirmed,
    createdAt,
  })
}
