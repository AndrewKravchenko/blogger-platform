import { Injectable } from '@nestjs/common'
import { Session } from '../domain/session.sql-entity'
import {
  FullSessionOutputMapper,
  FullSessionOutputModel,
  SessionOutputMapper,
  SessionOutputModel,
} from '../api/models/output/session.output.model'
import { RefreshedSession } from '../application/sessions.service'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, MoreThan, Not, Repository } from 'typeorm'

@Injectable()
export class SessionsSqlRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  public async getUserSessionsCount(userId: string): Promise<number> {
    return await this.sessionsRepository.count({
      where: {
        userId,
        expirationAt: MoreThan(new Date()),
      },
    })
  }

  async getSessionByDeviceId(deviceId: string): Promise<FullSessionOutputModel | null> {
    const session = await this.sessionsRepository.findOneBy({
      deviceId,
    })

    if (!session) {
      return null
    }

    return FullSessionOutputMapper(session)
  }

  async getSession(userId: string, deviceId: string): Promise<SessionOutputModel | null> {
    const session = await this.sessionsRepository.findOneBy({
      userId,
      deviceId,
    })

    if (!session) {
      return null
    }

    return SessionOutputMapper(session)
  }

  async createSession(session: Session): Promise<SessionOutputModel> {
    const createdSession = await this.sessionsRepository.save(session)
    return SessionOutputMapper(createdSession)
  }

  async refreshSession(userId: string, deviceId: string, refreshedSession: RefreshedSession): Promise<boolean> {
    const { ip, expirationAt, lastActiveDate } = refreshedSession

    const { affected } = await this.sessionsRepository.update(
      { userId, deviceId },
      {
        ip,
        expirationAt,
        lastActiveDate,
      },
    )
    return !!affected
  }

  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const { affected } = await this.sessionsRepository.delete({ deviceId })
    return !!affected
  }

  async deleteOldestSession(userId: string): Promise<void> {
    await this.sessionsRepository.delete({ userId, expirationAt: LessThan(new Date()) })
  }

  async deleteSessions(userId: string, currentSessionDeviceId: string): Promise<boolean> {
    const { affected } = await this.sessionsRepository.delete({
      userId: userId,
      deviceId: Not(currentSessionDeviceId),
    })
    return !!affected
  }
}
