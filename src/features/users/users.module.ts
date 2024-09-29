import { Module } from '@nestjs/common'
import { UsersService } from './application/users.service'
import { UsersSqlRepository } from './infrastructure/users.sql-repository'
import { UsersSqlQueryRepository } from './infrastructure/users.sql-query-repository'
import { SuperAdminUsersController } from './api/super-admin-users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './domain/user.sql-entity'
import { EmailConfirmation } from './domain/email-confirmation.sql-entity'
import { PasswordRecovery } from './domain/password-recovery.sql-entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailConfirmation, PasswordRecovery])],
  controllers: [SuperAdminUsersController],
  providers: [UsersSqlQueryRepository, UsersSqlRepository, UsersService],
  exports: [UsersSqlQueryRepository, UsersSqlRepository, UsersService],
})
export class UsersModule {}
