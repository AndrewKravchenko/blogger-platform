import { Injectable } from '@nestjs/common'
import { Blog } from '../domain/blog.entity'
import { FilterQuery, Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { BlogOutputMapper, BlogOutputModel } from '../api/models/output/blog.output.model'
import { QueryBlogInputModel } from '../api/models/input/query-blog.input.model'
import { paginationSkip } from '../../../infrastructure/utils/queryParams'
import { PaginatedResponse } from '../../../common/models/common.model'

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  public async getBlogs({
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    searchNameTerm,
  }: QueryBlogInputModel): Promise<PaginatedResponse<BlogOutputModel>> {
    const filter: FilterQuery<Blog> = {}

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' }
    }

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(paginationSkip(pageNumber, pageSize))
      .limit(pageSize)

    const totalCount = await this.blogModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs.map(BlogOutputMapper),
    }
  }

  public async getBlogById(blogId: string): Promise<BlogOutputModel | null> {
    const blog = await this.blogModel.findById(blogId)

    if (!blog) {
      return null
    }

    return BlogOutputMapper(blog)
  }
}
