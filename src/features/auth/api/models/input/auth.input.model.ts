import { IsString, IsUUID, Length } from 'class-validator'

export class ConfirmEmailInputModel {
  @IsUUID()
  code: string
}

export class NewPasswordRecoveryInputModel {
  @IsString()
  @Length(6, 20)
  newPassword: string

  @IsUUID()
  recoveryCode: string
}

export class UserPayload {
  userId: string
  deviceId: string
}
