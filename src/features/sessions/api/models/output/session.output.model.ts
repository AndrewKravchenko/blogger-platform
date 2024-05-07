import { Session } from '../../../domain/session.sql-entity'

type FullSessionInput = {
  ip: string
  userId: string
  deviceId: string
  title: string
  expirationAt: Date
  lastActiveDate: Date
}
export class SessionOutputModel {
  constructor(
    public ip: string,
    public deviceId: string,
    public title: string,
    public lastActiveDate: Date,
  ) {}
}

export class FullSessionOutputModel extends SessionOutputModel {
  public userId: string
  public expirationAt: Date

  constructor({ ip, userId, deviceId, title, expirationAt, lastActiveDate }: FullSessionInput) {
    super(ip, deviceId, title, lastActiveDate)

    this.userId = userId
    this.expirationAt = expirationAt
  }
}

// MAPPERS

export const SessionOutputMapper = ({ ip, deviceId, deviceName, lastActiveDate }: Session): SessionOutputModel => {
  return new SessionOutputModel(ip, deviceId, deviceName, lastActiveDate)
}

export const FullSessionOutputMapper = ({
  ip,
  userId,
  deviceId,
  deviceName,
  expirationAt,
  lastActiveDate,
}: Session): FullSessionOutputModel => {
  return new FullSessionOutputModel({
    ip,
    userId,
    deviceId,
    title: deviceName,
    expirationAt,
    lastActiveDate,
  })
}
