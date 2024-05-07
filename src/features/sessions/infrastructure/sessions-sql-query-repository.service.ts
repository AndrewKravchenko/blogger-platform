import { Injectable } from '@nestjs/common'
import { SessionOutputMapper, SessionOutputModel } from '../api/models/output/session.output.model'
import { getCurrentDateISOString } from '../../../infrastructure/utils/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class SessionsSqlQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getUserSessions(userId: string): Promise<SessionOutputModel[]> {
    const query = `
      SELECT *
      FROM public."Session"
      WHERE "userId"  = $1 AND "expirationAt" > $2
    `
    const params = [userId, getCurrentDateISOString()]
    const sessions = await this.dataSource.query(query, params)

    return sessions.map(SessionOutputMapper)
  }
}
