import { Module } from '@nestjs/common'
import { TestingService } from './application/testing.service'
import { TestingController } from './api/testing.controller'

@Module({
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
