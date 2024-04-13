import { SessionDocument } from '../../../domain/session.entity'

type FullSessionInput = {
  id: string
  ip: string
  userId: string
  deviceId: string
  title: string
  expirationAt: string
  lastActiveDate: string
}
export class SessionOutputModel {
  constructor(
    public ip: string,
    public deviceId: string,
    public title: string,
    public lastActiveDate: string,
  ) {}
}

export class FullSessionOutputModel extends SessionOutputModel {
  public id: string
  public userId: string
  public expirationAt: string

  constructor({ id, ip, userId, deviceId, title, expirationAt, lastActiveDate }: FullSessionInput) {
    super(ip, deviceId, title, lastActiveDate)

    this.id = id
    this.userId = userId
    this.expirationAt = expirationAt
  }
}

// MAPPERS

export const SessionOutputMapper = ({
  ip,
  deviceId,
  deviceName,
  lastActiveDate,
}: SessionDocument): SessionOutputModel => {
  return new SessionOutputModel(ip, deviceId, deviceName, lastActiveDate)
}

export const FullSessionOutputMapper = ({
  id,
  ip,
  userId,
  deviceId,
  deviceName,
  expirationAt,
  lastActiveDate,
}: SessionDocument): FullSessionOutputModel => {
  return new FullSessionOutputModel({
    id,
    ip,
    userId,
    deviceId,
    title: deviceName,
    expirationAt,
    lastActiveDate,
  })
}
