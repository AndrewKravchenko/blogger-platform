import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from '../../users/domain/user.sql-entity'

@Entity({ name: 'Session' })
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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User

  constructor(entity: Partial<Session>) {
    Object.assign(this, entity)
  }
}
