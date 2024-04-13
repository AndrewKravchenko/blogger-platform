import { IsUUID } from 'class-validator'

export class InputDeviceIdModel {
  @IsUUID()
  deviceId: string
}
