import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RequestLog } from '../domain/request-log.entity'
import { QueryRequestLogModel } from '../api/models/input/query-request-log.model'

@Injectable()
export class RequestLogsRepository {
  constructor(@InjectModel(RequestLog.name) private requestModel: Model<RequestLog>) {}

  async getRequestLogs({ ip, url, date }: QueryRequestLogModel): Promise<number> {
    return this.requestModel.countDocuments({
      ip,
      url,
      date: { $gte: date },
    })
  }

  async createRequestLogs(newRequestLog: RequestLog): Promise<void> {
    await this.requestModel.create(newRequestLog)
  }
}
