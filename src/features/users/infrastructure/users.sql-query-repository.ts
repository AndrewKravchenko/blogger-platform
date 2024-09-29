import { Injectable } from '@nestjs/common'
import {
  FullUserOutputMapper,
  FullUserOutputModel,
  MeOutputMapper,
  MeOutputModel,
  UserOutputMapper,
  UserOutputModel,
} from '../api/models/output/user.output.model'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, ILike, Repository } from 'typeorm'
import { QueryUserModel } from '../api/models/input/query-user.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { User } from '../domain/user.sql-entity'
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'

@Injectable()
export class UsersSqlQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}
  async getMe(userId: string): Promise<Nullable<MeOutputModel>> {
    const query = `
      SELECT *
      FROM public."User"
      WHERE id = $1
    `
    const params = [userId]

    const [user] = await this.dataSource.query(query, params)

    if (!user) {
      return null
    }

    return MeOutputMapper(user)
  }

  async getUserByLoginOrEmail(loginOrEmail: string, email?: string): Promise<Nullable<FullUserOutputModel>> {
    const query = `
      SELECT *
      FROM public."User"
      WHERE login = $1 OR email = $2
    `
    const params = [loginOrEmail, email || loginOrEmail]

    const [user] = await this.dataSource.query(query, params)

    if (!user) {
      return null
    }

    return FullUserOutputMapper(user)
  }

  async getUsers({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    searchLoginTerm,
    searchEmailTerm,
  }: QueryUserModel): Promise<PaginatedResponse<UserOutputModel>> {
    const where: FindOptionsWhere<User>[] = []

    if (searchLoginTerm) {
      where.push({ login: ILike(`%${searchLoginTerm}%`), isDeleted: false })
    }
    if (searchEmailTerm) {
      where.push({ email: ILike(`%${searchEmailTerm}%`), isDeleted: false })
    }
    if (!searchLoginTerm && !searchEmailTerm) {
      where.push({ isDeleted: false })
    }

    const queryOptions: FindManyOptions<User> = {
      where,
      order: { [sortBy]: sortDirection },
      take: pageSize,
      skip: pageSize * (pageNumber - 1),
    }

    const [users, totalCount] = await this.users.findAndCount(queryOptions)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: users.map(UserOutputMapper),
    }
  }

  async getUserById(userId: string): Promise<Nullable<UserOutputModel>> {
    const query = `
      SELECT *
      FROM public."User"
      WHERE id = $1`
    const [user] = await this.dataSource.query(query, [userId])

    if (!user) {
      return null
    }

    return UserOutputMapper(user)
  }
}
