import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.sql-entity'

@Entity({ name: 'PasswordRecovery' })
export class PasswordRecovery {
  @PrimaryColumn({ type: 'uuid' })
  userId: string

  @Column()
  code: string

  @Column({ type: 'timestamp' })
  expirationDate: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User

  constructor(entity: Partial<PasswordRecovery>) {
    Object.assign(this, entity)
  }
}
