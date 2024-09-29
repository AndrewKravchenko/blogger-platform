import { Injectable } from '@nestjs/common'
import {
  EmailConfirmationWithStatusOutputMapper,
  EmailConfirmationWithStatusOutputModel,
  FullUserOutputMapper,
  FullUserOutputModel,
  PasswordRecoveryOutputMapper,
  PasswordRecoveryOutputModel,
  UserOutputMapper,
  UserOutputModel,
} from '../api/models/output/user.output.model'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { PasswordHashResult } from '../application/users.service'
import { User } from '../domain/user.sql-entity'
import { EmailConfirmation } from '../domain/email-confirmation.sql-entity'
import { PasswordRecovery } from '../domain/password-recovery.sql-entity'

@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: Repository<EmailConfirmation>,
    @InjectRepository(PasswordRecovery)
    private readonly passwordRecoveryRepository: Repository<PasswordRecovery>,
  ) {}

  async getEmailConfirmation(confirmationCode: string): Promise<EmailConfirmationWithStatusOutputModel | null> {
    const emailConfirmation = await this.emailConfirmationRepository.findOne({
      where: { confirmationCode },
      relations: ['user'],
    })

    if (!emailConfirmation) {
      return null
    }

    return EmailConfirmationWithStatusOutputMapper(emailConfirmation)
  }

  async getPasswordRecoveryById(userId: string): Promise<PasswordRecoveryOutputModel | null> {
    const passwordRecovery = await this.passwordRecoveryRepository.findOneBy({ userId })

    if (!passwordRecovery) {
      return null
    }

    return PasswordRecoveryOutputMapper(passwordRecovery)
  }

  async getPasswordRecoveryByCode(code: string): Promise<PasswordRecoveryOutputModel | null> {
    const passwordRecovery = await this.passwordRecoveryRepository.findOneBy({ code })

    if (!passwordRecovery) {
      return null
    }

    return PasswordRecoveryOutputMapper(passwordRecovery)
  }

  async getUserByLoginOrEmail(loginOrEmail: string, email?: string): Promise<Nullable<FullUserOutputModel>> {
    const user = await this.usersRepository.findOneBy([{ login: loginOrEmail }, { email: email || loginOrEmail }])

    if (!user) {
      return null
    }

    return FullUserOutputMapper(user)
  }

  async createEmailConfirmation(emailConfirmation: EmailConfirmation): Promise<void> {
    await this.emailConfirmationRepository.save(emailConfirmation)
  }

  async create(user: User): Promise<UserOutputModel> {
    const createdUser = await this.usersRepository.save(user)
    return UserOutputMapper(createdUser)
  }

  async createPasswordRecovery(passwordRecovery: PasswordRecovery): Promise<void> {
    await this.passwordRecoveryRepository.save(passwordRecovery)
  }

  async updateRecoveryCode(userId: string, code: string, expirationDate: Date): Promise<void> {
    await this.passwordRecoveryRepository.update(
      { userId },
      {
        code,
        expirationDate,
      },
    )
  }

  async markEmailConfirmed(userId: string): Promise<boolean> {
    const { affected } = await this.usersRepository.update({ id: userId }, { isConfirmed: true })
    return !!affected
  }

  async changeEmailConfirmationCode(userId: string, confirmationCode: string): Promise<boolean> {
    const { affected } = await this.emailConfirmationRepository.update({ userId }, { confirmationCode })
    return !!affected
  }

  async changePassword(id: string, passwordData: PasswordHashResult): Promise<boolean> {
    const { affected } = await this.usersRepository.update(
      { id },
      {
        password: passwordData.passwordHash,
        passwordSalt: passwordData.passwordSalt,
      },
    )

    return !!affected
  }

  async deleteById(id: string): Promise<boolean> {
    const { affected } = await this.usersRepository.update({ id }, { isDeleted: true })
    return !!affected
  }
}
