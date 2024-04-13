import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { getCurrentDateISOString } from '../../../utils/common'

export type RequestLogDocument = HydratedDocument<RequestLog>

@Schema()
export class RequestLog {
  @Prop({ required: true })
  ip: string

  @Prop({ required: true })
  url: string

  @Prop({ type: Date, required: true })
  date: Date

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt?: string

  constructor({ ip, url, date }: RequestLog) {
    this.ip = ip
    this.url = url
    this.date = date
  }
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog)
