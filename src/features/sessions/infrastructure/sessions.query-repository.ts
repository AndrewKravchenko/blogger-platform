import { Injectable } from '@nestjs/common'
import { Session } from '../domain/session.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { SessionOutputMapper, SessionOutputModel } from '../api/models/output/session.output.model'
import { getCurrentDateISOString } from '../../../utils/common'

@Injectable()
export class SessionsQueryRepository {
  constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) {}

  async getUserSessions(userId: string): Promise<SessionOutputModel[]> {
    const sessions = await this.sessionModel.find({
      userId,
      expirationAt: { $gt: getCurrentDateISOString },
    })

    return sessions.map(SessionOutputMapper)
  }
}
