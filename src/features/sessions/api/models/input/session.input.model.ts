import { IsString } from 'class-validator'

export class InputDeviceIdModel {
  @IsString()
  deviceId: string
}
