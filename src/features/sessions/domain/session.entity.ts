import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { getCurrentDateISOString } from '../../../utils/common'

export type SessionDocument = HydratedDocument<Session>

@Schema()
export class Session {
  @Prop({ required: true })
  ip: string

  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  deviceId: string

  @Prop({ required: true })
  deviceName: string

  @Prop({ required: true })
  lastActiveDate: string

  @Prop({ required: true })
  expirationAt: string

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt?: string

  constructor({ ip, userId, deviceId, deviceName, lastActiveDate, expirationAt }: Session) {
    this.ip = ip
    this.userId = userId
    this.deviceId = deviceId
    this.deviceName = deviceName
    this.lastActiveDate = lastActiveDate
    this.expirationAt = expirationAt
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session)
