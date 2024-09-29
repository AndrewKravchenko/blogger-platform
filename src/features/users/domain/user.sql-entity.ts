import { Column, Entity, OneToMany, OneToOne, Unique } from 'typeorm'
import { BaseEntity } from '../../../base/entities/base.entity'
import { Session } from '../../sessions/domain/session.sql-entity'
import { EmailConfirmation } from './email-confirmation.sql-entity'

@Entity({ name: 'User' })
@Unique(['login', 'email'])
export class User extends BaseEntity<User> {
  @Column({ collation: 'C' })
  login: string

  @Column({ collation: 'C' })
  email: string

  @Column()
  password: string

  @Column()
  passwordSalt: string

  @Column()
  isDeleted: boolean

  @Column()
  isConfirmed: boolean

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[]

  @OneToOne(() => EmailConfirmation, (emailConfirmation) => emailConfirmation.user)
  emailConfirmation: EmailConfirmation
}
