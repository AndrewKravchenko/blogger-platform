import { IsEmail, IsMongoId, IsString, Length } from 'class-validator'
import { Trim } from '../../../../../infrastructure/decorators/transform/trim'

export class CreateUserInputModel {
  @IsString()
  @Trim()
  @Length(3, 10)
  login: string

  @IsString()
  @Trim()
  @Length(6, 20)
  password: string

  @IsEmail()
  email: string
}

export class InputUserId {
  @IsMongoId()
  userId: string
}

export class CreateUserModel {
  login: string
  password: string
  email: string
  passwordSalt: string
  isDeleted: boolean
  // passwordRecovery?: PasswordRecovery
  // emailConfirmation?: EmailConfirmation
}
