import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

@Entity()
export class EmailConfirmation {
  @PrimaryColumn({ type: 'uuid' })
  userId: string

  @Column()
  confirmationCode: string

  @Column({ type: 'timestamp' })
  expirationDate: Date

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}

@Entity()
export class PasswordRecovery {
  @PrimaryColumn({ type: 'uuid' })
  userId: string

  @Column()
  code: string

  @Column({ type: 'timestamp' })
  expirationDate: Date

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}

@Entity()
export class User {
  @PrimaryColumn({ type: 'uuid', default: () => uuidv4() })
  id: string

  @Column()
  login: string

  @Column()
  email: string

  @Column()
  password: string

  @Column()
  passwordSalt: string

  @Column()
  isDeleted: boolean

  @Column()
  isConfirmed: boolean

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  constructor(user: CreateUserModel) {
    this.login = user.login
    this.email = user.email
    this.password = user.password
    this.passwordSalt = user.passwordSalt
    this.isConfirmed = user.isConfirmed
    this.isDeleted = user.isDeleted
  }
}

export type CreateUserModel = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
