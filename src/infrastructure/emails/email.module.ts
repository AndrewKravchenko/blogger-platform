import { Module } from '@nestjs/common'
import { EmailsService } from './application/emails.service'

@Module({
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailModule {}
