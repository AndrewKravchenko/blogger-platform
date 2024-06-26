import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CreateUserInputModel } from './models/input/create-user-input.model'
import { UserOutputModel } from './models/output/user.output.model'
import { UsersService } from '../application/users.service'
import { QueryUserModel } from './models/input/query-user.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { handleInterlayerResult } from '../../../common/models/result-layer.model'
import { BasicAuthGuard } from '../../../infrastructure/guards/auth.guard'
import { UsersSqlQueryRepository } from '../infrastructure/users.sql-query-repository'

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class SuperAdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  @Get()
  async getUsers(@Query() query: QueryUserModel): Promise<PaginatedResponse<UserOutputModel>> {
    return await this.usersSqlQueryRepository.getUsers(query)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userInputModel: CreateUserInputModel): Promise<UserOutputModel | void> {
    const result = await this.usersService.create(userInputModel)
    return handleInterlayerResult(result)
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
    const result = await this.usersService.deleteById(userId)
    return handleInterlayerResult(result)
  }
}
