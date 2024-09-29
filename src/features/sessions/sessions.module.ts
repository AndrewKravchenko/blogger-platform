import { Module } from '@nestjs/common'
import { SessionsService } from './application/sessions.service'
import { SessionsController } from './api/sessions.controller'
import { SessionsSqlQueryRepository } from './infrastructure/sessions-sql-query-repository.service'
import { SessionsSqlRepository } from './infrastructure/sessions.sql-repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Session } from './domain/session.sql-entity'

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [SessionsController],
  providers: [SessionsSqlRepository, SessionsSqlQueryRepository, SessionsService],
  exports: [SessionsService, SessionsSqlRepository, SessionsSqlQueryRepository],
})
export class SessionsModule {}
