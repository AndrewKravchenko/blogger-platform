import { IsEmail, IsString, Length } from 'class-validator'
import { Trim } from '../../../../../infrastructure/decorators/transform/trim'

export class SignUpUserInputModel {
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
