import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { getCurrentDateISOString } from '../../../infrastructure/utils/common'

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
  lastActiveDate: Date

  @Prop({ required: true })
  expirationAt: Date

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt?: Date

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
