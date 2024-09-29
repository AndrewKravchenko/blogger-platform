import { Injectable } from '@nestjs/common'
import { InterlayerResult, InterlayerResultCode } from '../../../common/models/result-layer.model'
import { Session } from '../domain/session.sql-entity'
import { SessionOutputModel } from '../api/models/output/session.output.model'
import { SessionsSqlRepository } from '../infrastructure/sessions.sql-repository'
import { SessionsSqlQueryRepository } from '../infrastructure/sessions-sql-query-repository.service'

export type RefreshedSession = {
  ip: string
  expirationAt: Date
  lastActiveDate: Date
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsSqlRepository: SessionsSqlRepository,
    private readonly sessionsSqlQueryRepository: SessionsSqlQueryRepository,
  ) {}

  async getSessions(userId: string): Promise<SessionOutputModel[]> {
    return await this.sessionsSqlQueryRepository.getUserSessions(userId)
  }

  async getUserSessionsCount(userId: string): Promise<number> {
    return await this.sessionsSqlRepository.getUserSessionsCount(userId)
  }

  async createSession(newSession: Session) {
    return await this.sessionsSqlRepository.createSession(newSession)
  }

  async refreshSession(userId: string, deviceId: string, refreshedSession: RefreshedSession): Promise<boolean> {
    return await this.sessionsSqlRepository.refreshSession(userId, deviceId, refreshedSession)
  }

  async deleteSessionByDeviceId(userId: string, deviceId: string): Promise<InterlayerResult> {
    const session = await this.sessionsSqlRepository.getSessionByDeviceId(deviceId)

    if (!session) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
    if (session.userId !== userId) {
      return InterlayerResult.Error(InterlayerResultCode.Forbidden)
    }

    await this.sessionsSqlRepository.deleteSessionByDeviceId(deviceId)
    return InterlayerResult.Ok()
  }

  async deleteSessions(userId: string, currentDeviceId: string): Promise<InterlayerResult> {
    const isDeleted = await this.sessionsSqlRepository.deleteSessions(userId, currentDeviceId)
    return isDeleted ? InterlayerResult.Ok() : InterlayerResult.Error(InterlayerResultCode.NotFound)
  }

  async deleteOldestSession(userId: string): Promise<void> {
    await this.sessionsSqlRepository.deleteOldestSession(userId)
  }
}
