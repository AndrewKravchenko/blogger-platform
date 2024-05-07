import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { CreateUserModel } from '../api/models/input/create-user-input.model'
import { getCurrentDateISOString } from '../../../infrastructure/utils/common'

export type UserDocument = HydratedDocument<User>
export type EmailConfirmationDocument = HydratedDocument<EmailConfirmation>
export type PasswordRecoveryDocument = HydratedDocument<PasswordRecovery>

@Schema()
export class EmailConfirmation {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  confirmationCode: string

  @Prop({ required: true })
  expirationDate: Date
}

export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation)

export class PasswordRecovery {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  code: string

  @Prop({ required: true })
  expirationDate: Date

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
  isConfirmed: boolean

  @Prop({ required: true })
  isDeleted: boolean

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt: string

  @Prop({ _id: false, type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation | null

  @Prop({ _id: false, type: PasswordRecoverySchema })
  passwordRecovery: PasswordRecovery | null

  constructor(userData: CreateUserModel) {
    this.login = userData.login
    this.email = userData.email
    this.password = userData.password
    this.passwordSalt = userData.passwordSalt
    this.isConfirmed = userData.isConfirmed
    this.isDeleted = userData.isDeleted
    this.emailConfirmation = userData.emailConfirmation || null
    this.passwordRecovery = userData.passwordRecovery || null
  }
}

export const UserSchema = SchemaFactory.createForClass(User)
