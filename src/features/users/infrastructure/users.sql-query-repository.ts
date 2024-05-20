import { Injectable } from '@nestjs/common'
import {
  FullUserOutputMapper,
  FullUserOutputModel,
  MeOutputMapper,
  MeOutputModel,
  UserOutputMapper,
  UserOutputModel,
} from '../api/models/output/user.output.model'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { QueryUserModel } from '../api/models/input/query-user.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { paginationSkip } from '../../../infrastructure/utils/queryParams'

@Injectable()
export class UsersSqlQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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
    let usersQuery = `
      SELECT *
      FROM "User"
      WHERE "isDeleted" = false
    `
    let totalCountQuery = `
      SELECT COUNT(*)
      FROM public."User"
      WHERE "isDeleted" = false
    `

    const searchParams: any[] = []

    if (searchLoginTerm) {
      usersQuery += ` AND login ILIKE $${searchParams.length + 1}`
      totalCountQuery += ` AND login ILIKE $${searchParams.length + 1}`
      searchParams.push(`%${searchLoginTerm}%`)
    }

    if (searchEmailTerm) {
      usersQuery += ` ${searchLoginTerm ? 'OR' : 'AND'} email ILIKE $${searchParams.length + 1}`
      totalCountQuery += ` ${searchLoginTerm ? 'OR' : 'AND'} email ILIKE $${searchParams.length + 1}`
      searchParams.push(`%${searchEmailTerm}%`)
    }

    usersQuery += `
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $${searchParams.length + 1}
      OFFSET $${searchParams.length + 2}
    `

    const users = await this.dataSource.query(usersQuery, [
      ...searchParams,
      pageSize,
      paginationSkip(pageNumber, pageSize),
    ])

    const [{ count }] = await this.dataSource.query(totalCountQuery, searchParams)
    const pagesCount = Math.ceil(count / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: +count,
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
