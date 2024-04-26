import { Module } from '@nestjs/common'
import { SessionsService } from './application/sessions.service'
import { SessionsController } from './api/sessions.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Session, SessionSchema } from './domain/session.entity'
import { SessionsQueryRepository } from './infrastructure/sessions.query-repository'
import { SessionsRepository } from './infrastructure/sessions.repository'

@Module({
  imports: [MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }])],
  controllers: [SessionsController],
  providers: [SessionsRepository, SessionsQueryRepository, SessionsService],
  exports: [SessionsService, SessionsRepository, SessionsQueryRepository],
})
export class SessionsModule {}
