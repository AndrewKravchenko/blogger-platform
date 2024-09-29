import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class TestingService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async dropDatabase() {
    await this.dataSource.query('DELETE FROM "Session"')
    await this.dataSource.query('DELETE FROM "Blog"')
    await this.dataSource.query('DELETE FROM "Post"')
    await this.dataSource.query('DELETE FROM "Comment"')
    await this.dataSource.query('DELETE FROM "Like"')
    await this.dataSource.query('DELETE FROM "User" CASCADE')
  }
}
