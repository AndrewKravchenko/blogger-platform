import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { UsersQueryRepository } from '../infrastructure/users.query-repository'
import { CreateUserInputModel, InputUserId } from './models/input/create-user.input.model'
import { UserOutputModel } from './models/output/user.output.model'
import { UsersService } from '../application/users.service'
// import { BasicAuthGuard } from '../../../infrastructure/guards/auth.guard'
import { QueryUserModel } from './models/input/query-user.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'

@Controller('users')
// @UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get()
  async getUsers(@Query() query: QueryUserModel): Promise<PaginatedResponse<UserOutputModel>> {
    return await this.usersQueryRepository.getUsers(query)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userInputModel: CreateUserInputModel): Promise<UserOutputModel> {
    return await this.usersService.create(userInputModel)
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() { userId }: InputUserId): Promise<void> {
    const isDeleted = await this.usersService.deleteById(userId)

    if (!isDeleted) {
      throw new NotFoundException()
    }
  }
}
