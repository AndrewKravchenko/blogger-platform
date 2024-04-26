import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common'
import { TestingService } from '../application/testing.service'

@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(): Promise<void> {
    return await this.testingService.dropDatabase()
  }
}
