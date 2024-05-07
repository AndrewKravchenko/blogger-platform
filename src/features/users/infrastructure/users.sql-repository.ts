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
import { DataSource } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { PasswordHashResult } from '../application/users.service'
import { CreateUserModel } from '../domain/user.sql-entity'

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getEmailConfirmation(confirmationCode: string): Promise<EmailConfirmationWithStatusOutputModel | null> {
    const query = `
      SELECT "EmailConfirmation".*, "User"."isConfirmed"
      FROM "EmailConfirmation"
      JOIN "User" ON "EmailConfirmation"."userId" = "User"."id"
      WHERE "confirmationCode" = $1
    `
    const params = [confirmationCode]
    const [emailConfirmation] = await this.dataSource.query(query, params)

    if (!emailConfirmation) {
      return null
    }

    return EmailConfirmationWithStatusOutputMapper(emailConfirmation)
  }

  async getPasswordRecoveryById(userId: string): Promise<PasswordRecoveryOutputModel | null> {
    const query = `
      SELECT *
      FROM "PasswordRecovery"
      WHERE "userId" = $1
    `
    const params = [userId]
    const [passwordRecovery] = await this.dataSource.query(query, params)

    if (!passwordRecovery) {
      return null
    }

    return PasswordRecoveryOutputMapper(passwordRecovery)
  }

  async getPasswordRecoveryByCode(confirmationCode: string): Promise<PasswordRecoveryOutputModel | null> {
    const query = `
      SELECT *
      FROM "PasswordRecovery"
      WHERE "code" = $1
    `
    const params = [confirmationCode]
    const [passwordRecovery] = await this.dataSource.query(query, params)

    if (!passwordRecovery) {
      return null
    }

    return PasswordRecoveryOutputMapper(passwordRecovery)
  }

  async getUserByLoginOrEmail(loginOrEmail: string, email?: string): Promise<Nullable<FullUserOutputModel>> {
    const query = `
      SELECT *
      FROM "User"
      WHERE login ILIKE $1 OR email ILIKE $2
    `
    const params = [loginOrEmail, email || loginOrEmail]

    const [user] = await this.dataSource.query(query, params)

    if (!user) {
      return null
    }

    return FullUserOutputMapper(user)
  }

  async createEmailConfirmation(userId: string, confirmationCode: string, expirationDate: Date): Promise<void> {
    const emailConfirmationQuery = `
        INSERT INTO "EmailConfirmation"("userId", "confirmationCode", "expirationDate")
        VALUES ($1, $2, $3)
    `
    const params = [userId, confirmationCode, expirationDate]
    await this.dataSource.query(emailConfirmationQuery, params)
  }

  async setUserIdToEmailConfirmation(emailConfirmationId: string, userId: string): Promise<void> {
    const query = `
    UPDATE "EmailConfirmation"
    SET "userId" = $1
    WHERE id = $2
    `
    const params = [userId, emailConfirmationId]
    await this.dataSource.query(query, params)
  }

  async create({
    login,
    email,
    password,
    passwordSalt,
    isDeleted,
    isConfirmed,
  }: CreateUserModel): Promise<UserOutputModel> {
    const query = `
      INSERT INTO "User"("login", "email", "password", "passwordSalt", "isDeleted", "isConfirmed")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const params = [login, email, password, passwordSalt, isDeleted, isConfirmed]

    const [createdUser] = await this.dataSource.query(query, params)
    return UserOutputMapper(createdUser)
  }

  async createPasswordRecovery(userId: string, code: string, expirationDate: Date): Promise<void> {
    const query = `
        INSERT INTO "PasswordRecovery"("userId", "code", "expirationDate")
        VALUES ($1, $2, $3)
    `
    const params = [userId, code, expirationDate]
    await this.dataSource.query(query, params)
  }

  async updateRecoveryCode(userId: string, code: string, expirationDate: Date): Promise<void> {
    const query = `
        UPDATE "PasswordRecovery"
        SET "code" = $1, "expirationDate" = $2
        WHERE "userId" = $3
        VALUES ($1, $2, $3)
    `
    const params = [code, expirationDate, userId]
    await this.dataSource.query(query, params)
  }

  async markEmailConfirmed(userId: string): Promise<boolean> {
    const query = `
        UPDATE "User"
        SET "isConfirmed" = true
        WHERE id = $1
    `
    const params = [userId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async changeEmailConfirmationCode(userId: string, confirmationCode: string): Promise<boolean> {
    const query = `
        UPDATE "EmailConfirmation"
        SET "confirmationCode" = $1
        WHERE "userId" = $2
    `
    const params = [confirmationCode, userId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async changePassword(userId: string, passwordData: PasswordHashResult): Promise<boolean> {
    const query = `
        UPDATE "User"
        SET "passwordSalt" = $1, "password" = $2
        WHERE "id" = $3
    `
    const params = [passwordData.passwordSalt, passwordData.passwordHash, userId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async deleteById(userId: string): Promise<boolean> {
    const query = `
      UPDATE "User"
      SET "isDeleted" = true
      WHERE id = $1
    `
    const params = [userId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }
}
