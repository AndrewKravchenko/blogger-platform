import { Injectable } from '@nestjs/common'
import { BlogOutputMapper, BlogOutputModel } from '../api/models/output/blog.output.model'
import { QueryBlogInputModel } from '../api/models/input/query-blog.input.model'
import { paginationSkip } from '../../../../infrastructure/utils/queryParams'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getBlogs({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    searchNameTerm,
  }: QueryBlogInputModel): Promise<PaginatedResponse<BlogOutputModel>> {
    let blogsQuery = `
      SELECT * FROM "Blog"
    `
    let totalCountQuery = `
      SELECT COUNT(*) FROM "Blog"
    `
    const searchParams: any[] = []

    if (searchNameTerm) {
      blogsQuery += ` WHERE name ILIKE $${searchParams.length + 1}`
      totalCountQuery += ` WHERE name ILIKE $${searchParams.length + 1}`
      searchParams.push(`%${searchNameTerm}%`)
    }

    blogsQuery += `
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $${searchParams.length + 1}
      OFFSET $${searchParams.length + 2}
    `
    const blogs = await this.dataSource.query(blogsQuery, [
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
      items: blogs.map(BlogOutputMapper),
    }
  }

  async getBlogById(blogId: string): Promise<BlogOutputModel | null> {
    const query = `
      SELECT *
      FROM "Blog"
      WHERE id = $1`
    const params = [blogId]

    const [blog] = await this.dataSource.query(query, params)

    if (!blog) {
      return null
    }

    return BlogOutputMapper(blog)
  }
}
