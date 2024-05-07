import { Injectable } from '@nestjs/common'
import { Session } from '../domain/session.sql-entity'
import { getCurrentDateISOString } from '../../../infrastructure/utils/common'
import {
  FullSessionOutputMapper,
  FullSessionOutputModel,
  SessionOutputMapper,
  SessionOutputModel,
} from '../api/models/output/session.output.model'
import { RefreshedSession } from '../application/sessions.service'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class SessionsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async getUserSessionsCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) AS count
      FROM "Session"
      WHERE "userId" = $1 AND "expirationAt" > $2
    `
    const params = [userId, getCurrentDateISOString()]

    const [{ count }] = await this.dataSource.query(query, params)
    return +count
  }

  async getSessionByDeviceId(deviceId: string): Promise<FullSessionOutputModel | null> {
    const query = `
      SELECT * 
      FROM public."Session"
      WHERE "deviceId" = $1
    `
    const params = [deviceId]

    const [session] = await this.dataSource.query(query, params)

    if (!session) {
      return null
    }

    return FullSessionOutputMapper(session)
  }

  async getSession(userId: string, deviceId: string): Promise<SessionOutputModel | null> {
    const query = `
      SELECT *
      FROM "Session"
      WHERE "userId" = $1 AND "deviceId" = $2
    `
    const params = [userId, deviceId]

    const [session] = await this.dataSource.query(query, params)

    if (!session) {
      return null
    }

    return SessionOutputMapper(session)
  }

  async createSession({
    ip,
    userId,
    deviceId,
    deviceName,
    lastActiveDate,
    expirationAt,
  }: Session): Promise<SessionOutputModel> {
    const query = `
      INSERT INTO "Session"("ip", "userId", "deviceId", "deviceName", "lastActiveDate", "expirationAt")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `
    const params = [ip, userId, deviceId, deviceName, lastActiveDate, expirationAt]

    const [createdSession] = await this.dataSource.query(query, params)
    return SessionOutputMapper(createdSession)
  }

  async refreshSession(userId: string, deviceId: string, refreshedSession: RefreshedSession): Promise<boolean> {
    const query = `
      UPDATE "Session"
      SET ip = $1, "expirationAt" = $2, "lastActiveDate" = $3
      WHERE "userId" = $4 AND "deviceId" = $5
    `
    const params = [
      refreshedSession.ip,
      refreshedSession.expirationAt,
      refreshedSession.lastActiveDate,
      userId,
      deviceId,
    ]

    const result = await this.dataSource.query(query, params)
    return !!result.affected
  }

  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const query = `
      DELETE FROM "Session"
      WHERE "deviceId" = $1
    `
    const params = [deviceId]
    const result = await this.dataSource.query(query, params)

    return !!result.affected
  }

  async deleteOldestSession(userId: string): Promise<boolean> {
    const query = `
      DELETE FROM "Session"
      WHERE "userId" = $1 AND "expirationAt" < $2
    `
    const params = [userId, getCurrentDateISOString()]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async deleteSessions(userId: string, currentSessionDeviceId: string): Promise<boolean> {
    const query = `
      DELETE FROM "Session"
      WHERE "userId" = $1 AND "deviceId" != $2
    `
    const params = [userId, currentSessionDeviceId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }
}
