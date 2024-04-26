import { Module } from '@nestjs/common'
import { UsersController } from './api/users.controller'
import { UsersService } from './application/users.service'
import { UsersQueryRepository } from './infrastructure/users.query-repository'
import { UsersRepository } from './infrastructure/users.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './domain/user.entity'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersQueryRepository, UsersRepository, UsersService],
  exports: [UsersQueryRepository, UsersRepository, UsersService],
})
export class UsersModule {}
