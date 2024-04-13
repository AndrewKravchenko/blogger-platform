import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Session } from '../domain/session.entity'
import { getCurrentDateISOString } from '../../../utils/common'
import {
  FullSessionOutputMapper,
  FullSessionOutputModel,
  SessionOutputMapper,
  SessionOutputModel,
} from '../api/models/output/session.output.model'
import { RefreshedSession } from '../application/sessions.service'

@Injectable()
export class SessionsRepository {
  constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) {}

  public async getUserSessionsCount(userId: string): Promise<number> {
    return this.sessionModel.countDocuments({
      userId,
      expirationAt: { $gt: getCurrentDateISOString },
    })
  }

  async getSessionByDeviceId(deviceId: string): Promise<FullSessionOutputModel | null> {
    const session = await this.sessionModel.findOne({ deviceId })

    if (!session) {
      return null
    }

    return FullSessionOutputMapper(session)
  }

  async getSession(userId: string, deviceId: string): Promise<SessionOutputModel | null> {
    const session = await this.sessionModel.findOne({ userId, deviceId })

    if (!session) {
      return null
    }

    return SessionOutputMapper(session)
  }

  async createSession(newSession: Session): Promise<SessionOutputModel> {
    const session = await this.sessionModel.create(newSession)
    return SessionOutputMapper(session)
  }

  async refreshSession(userId: string, deviceId: string, refreshedSession: RefreshedSession): Promise<boolean> {
    const result = await this.sessionModel.updateOne({ userId, deviceId }, { $set: refreshedSession })
    return !!result.matchedCount
  }

  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.sessionModel.deleteOne({ deviceId })
    return !!result.deletedCount
  }

  async deleteOldestSession(userId: string): Promise<boolean> {
    const result = await this.sessionModel.deleteOne({
      userId,
      expirationAt: { $lt: getCurrentDateISOString },
    })

    return !!result.deletedCount
  }

  async deleteSessions(userId: string, currentSessionDeviceId: string): Promise<void> {
    await this.sessionModel.deleteMany({ userId, deviceId: { $ne: currentSessionDeviceId } })
  }
}
