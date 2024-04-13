import { Injectable } from '@nestjs/common'
import { SessionsRepository } from '../infrastructure/sessions.repository'
import { SessionsQueryRepository } from '../infrastructure/sessions.query-repository'
import { Result, ResultCode } from '../../../common/models/result-layer.model'
import { Session } from '../domain/session.entity'
import { SessionOutputModel } from '../api/models/output/session.output.model'

export type RefreshedSession = {
  ip: string
  expirationAt: string
  lastActiveDate: string
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly sessionsQueryRepository: SessionsQueryRepository,
  ) {}

  async getSessions(userId: string): Promise<SessionOutputModel[]> {
    return await this.sessionsQueryRepository.getUserSessions(userId)
  }

  async createSession(newSession: Session) {
    return await this.sessionsRepository.createSession(newSession)
  }

  async deleteSessionByDeviceId(userId: string, deviceId: string): Promise<Result<any>> {
    const session = await this.sessionsRepository.getSessionByDeviceId(deviceId)

    if (!session) {
      return { resultCode: ResultCode.NotFound }
    }
    if (session.userId !== userId) {
      return { resultCode: ResultCode.Forbidden }
    }

    await this.sessionsRepository.deleteSessionByDeviceId(deviceId)
    return { resultCode: ResultCode.Success }
  }

  async deleteSessions(userId: string, currentDeviceId: string) {
    return await this.sessionsRepository.deleteSessions(userId, currentDeviceId)
  }
}
