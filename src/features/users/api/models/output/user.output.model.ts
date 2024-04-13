import { EmailConfirmation, PasswordRecovery, UserDocument } from '../../../domain/user.entity'

type FullUserInput = {
  id: string
  login: string
  email: string
  password: string
  passwordSalt: string
  isDeleted: boolean
  emailConfirmation?: EmailConfirmation
  passwordRecovery?: PasswordRecovery
  createdAt: string
}

export class MeOutputModel {
  constructor(
    public userId: string,
    public login: string,
    public email: string,
  ) {}
}

export class UserOutputModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
  ) {}
}

export class FullUserOutputModel extends UserOutputModel {
  public password: string
  public passwordSalt: string
  public isDeleted: boolean
  public emailConfirmation?: EmailConfirmation
  public passwordRecovery?: PasswordRecovery

  constructor({
    id,
    login,
    email,
    password,
    passwordSalt,
    isDeleted,
    emailConfirmation,
    passwordRecovery,
    createdAt,
  }: FullUserInput) {
    super(id, login, email, createdAt)

    this.password = password
    this.passwordSalt = passwordSalt
    this.isDeleted = isDeleted
    this.emailConfirmation = emailConfirmation
    this.passwordRecovery = passwordRecovery
  }
}

// MAPPERS

export const MeOutputMapper = ({ id, login, email }: UserDocument): MeOutputModel => {
  return new MeOutputModel(id, login, email)
}

export const UserOutputMapper = ({ id, login, email, createdAt }: UserDocument): UserOutputModel => {
  return new UserOutputModel(id, login, email, createdAt)
}

export const FullUserOutputMapper = ({
  id,
  login,
  email,
  password,
  passwordSalt,
  isDeleted,
  emailConfirmation,
  passwordRecovery,
  createdAt,
}: UserDocument): FullUserOutputModel => {
  return new FullUserOutputModel({
    id,
    login,
    email,
    password,
    passwordSalt,
    isDeleted,
    emailConfirmation,
    passwordRecovery,
    createdAt,
  })
}
