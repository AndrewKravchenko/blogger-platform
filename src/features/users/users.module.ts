import { Module } from '@nestjs/common'
import { UsersService } from './application/users.service'
import { UsersQueryRepository } from './infrastructure/users.query-repository'
import { UsersRepository } from './infrastructure/users.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './domain/user.entity'
import { UsersSqlRepository } from './infrastructure/users.sql-repository'
import { UsersSqlQueryRepository } from './infrastructure/users.sql-query-repository'
import { SuperAdminUsersController } from './api/super-admin-users.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [SuperAdminUsersController],
  providers: [UsersSqlQueryRepository, UsersQueryRepository, UsersRepository, UsersSqlRepository, UsersService],
  exports: [UsersQueryRepository, UsersSqlQueryRepository, UsersSqlRepository, UsersRepository, UsersService],
})
export class UsersModule {}
