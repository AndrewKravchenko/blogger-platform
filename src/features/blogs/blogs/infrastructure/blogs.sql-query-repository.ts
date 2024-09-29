import { Injectable } from '@nestjs/common'
import { BlogOutputMapper, BlogOutputModel } from '../api/models/output/blog.output.model'
import { QueryBlogInputModel } from '../api/models/input/query-blog.input.model'
import { paginationSkip } from '../../../../infrastructure/utils/queryParams'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Blog } from '../domain/blog.sql-entity'

@Injectable()
export class BlogsSqlQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async getBlogs({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    searchNameTerm,
  }: QueryBlogInputModel): Promise<PaginatedResponse<BlogOutputModel>> {
    const queryBuilder = this.blogsRepository.createQueryBuilder('b')

    if (searchNameTerm) {
      queryBuilder.where('b.name ILIKE :searchTerm', { searchTerm: `%${searchNameTerm}%` })
    }

    queryBuilder
      .orderBy(`b.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .take(pageSize)
      .skip(paginationSkip(pageNumber, pageSize))

    const [blogs, totalCount] = await queryBuilder.getManyAndCount()
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs.map(BlogOutputMapper),
    }
  }

  async getBlogById(blogId: string): Promise<BlogOutputModel | null> {
    const blog = await this.blogsRepository.createQueryBuilder().where('id = :id', { id: blogId }).getOne()

    if (!blog) {
      return null
    }

    return BlogOutputMapper(blog)
  }
}
