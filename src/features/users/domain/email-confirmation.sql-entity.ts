import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.sql-entity'

@Entity({ name: 'EmailConfirmation' })
export class EmailConfirmation {
  @PrimaryColumn({ type: 'uuid' })
  userId: string

  @Column()
  confirmationCode: string

  @Column({ type: 'timestamp' })
  expirationDate: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => User, (user) => user.emailConfirmation)
  @JoinColumn()
  user: User

  constructor(entity: Partial<EmailConfirmation>) {
    Object.assign(this, entity)
  }
}
