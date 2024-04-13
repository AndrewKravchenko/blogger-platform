import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { CreateUserModel } from '../api/models/input/create-user-input.model'
import { getCurrentDateISOString } from '../../../utils/common'

export type UserDocument = HydratedDocument<User>

@Schema()
export class EmailConfirmation {
  @Prop({ required: true }) confirmationCode: string
  @Prop({ required: true }) expirationDate: Date
  @Prop({ required: true }) isConfirmed: boolean
}

export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation)

export class PasswordRecovery {
  @Prop({ required: true }) code: string
  @Prop({ required: true }) expirationDate: Date

  constructor(code: string, expirationDate: Date) {
    this.code = code
    this.expirationDate = expirationDate
  }
}

export const PasswordRecoverySchema = SchemaFactory.createForClass(PasswordRecovery)

@Schema()
export class User {
  @Prop({ required: true })
  login: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  passwordSalt: string

  @Prop({ required: true })
  isDeleted: boolean

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt: string

  @Prop({ _id: false, type: EmailConfirmationSchema })
  emailConfirmation?: EmailConfirmation

  @Prop({ _id: false, type: PasswordRecoverySchema })
  passwordRecovery?: PasswordRecovery

  constructor(userData: CreateUserModel) {
    this.login = userData.login
    this.email = userData.email
    this.password = userData.password
    this.passwordSalt = userData.passwordSalt
    this.isDeleted = userData.isDeleted
    this.emailConfirmation = userData.emailConfirmation
    this.passwordRecovery = userData.passwordRecovery
  }
}

export const UserSchema = SchemaFactory.createForClass(User)
