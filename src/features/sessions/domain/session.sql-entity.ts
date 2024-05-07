import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string

  @Column()
  userId: string

  @Column()
  ip: string

  @Column()
  deviceName: string

  @Column({ type: 'timestamp' })
  lastActiveDate: Date

  @Column({ type: 'timestamp' })
  expirationAt: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  constructor({
    ip,
    userId,
    deviceId,
    deviceName,
    lastActiveDate,
    expirationAt,
  }: Omit<Session, 'createdAt' | 'updatedAt'>) {
    this.ip = ip
    this.userId = userId
    this.deviceId = deviceId
    this.deviceName = deviceName
    this.lastActiveDate = lastActiveDate
    this.expirationAt = expirationAt
  }
}
