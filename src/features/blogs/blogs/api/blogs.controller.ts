import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common'
import { BlogOutputModel } from './models/output/blog.output.model'
import { QueryBlogInputModel } from './models/input/query-blog.input.model'
import { QueryPostModel } from '../../posts/api/models/input/query-post.input.model'
import { Request } from 'express'
import { PostOutputModel } from '../../posts/api/models/output/post.output.model'
import { QueryBus } from '@nestjs/cqrs'
import { GetPostsByBlogIdQueryPayload } from '../application/use-cases/queries/get-posts-by-blog-id.handler'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { handleInterlayerResult, InterlayerResult } from '../../../../common/models/result-layer.model'
import { BlogsSqlQueryRepository } from '../infrastructure/blogs.sql-query-repository'

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
  ) {}

  @Get()
  async getBlogs(@Query() query: QueryBlogInputModel): Promise<PaginatedResponse<BlogOutputModel>> {
    return await this.blogsSqlQueryRepository.getBlogs(query)
  }

  @Get(':blogId')
  async getBlogById(@Param('blogId', new ParseUUIDPipe()) blogId: string): Promise<BlogOutputModel | void> {
    const blog = await this.blogsSqlQueryRepository.getBlogById(blogId)

    if (!blog) {
      throw new NotFoundException()
    }

    return blog
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Req() req: Request,
    @Query() query: QueryPostModel,
    @Param('blogId', new ParseUUIDPipe()) blogId: string,
  ): Promise<PaginatedResponse<PostOutputModel> | void> {
    const queryPayload = new GetPostsByBlogIdQueryPayload({ blogId, userId: req.user?.id, ...query })
    const result = await this.queryBus.execute<
      GetPostsByBlogIdQueryPayload,
      InterlayerResult<Nullable<PaginatedResponse<PostOutputModel>>>
    >(queryPayload)

    return handleInterlayerResult(result)
  }
}
