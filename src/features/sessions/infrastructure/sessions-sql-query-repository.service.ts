import { Injectable } from '@nestjs/common'
import { SessionOutputMapper, SessionOutputModel } from '../api/models/output/session.output.model'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThan, Repository } from 'typeorm'
import { Session } from '../domain/session.sql-entity'

@Injectable()
export class SessionsSqlQueryRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  async getUserSessions(userId: string): Promise<SessionOutputModel[]> {
    const sessions = await this.sessionsRepository.find({
      where: {
        userId,
        expirationAt: MoreThan(new Date()),
      },
    })
    return sessions.map(SessionOutputMapper)
  }
}
