import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CreateBlogInputModel, CreatePostToBlogInputModel } from './models/input/create-blog.input.model'
import { BlogOutputModel } from './models/output/blog.output.model'
import { QueryBlogInputModel } from './models/input/query-blog.input.model'
import { QueryPostModel } from '../../posts/api/models/input/query-post.input.model'
import { Request } from 'express'
import { PostOutputModel } from '../../posts/api/models/output/post.output.model'
import { UpdateBlogInputModel } from './models/input/update-blog.input.model'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreateBlogCommand } from '../application/use-cases/commands/create-blog.handler'
import { CreatePostToBlogCommand } from '../application/use-cases/commands/create-post-to-blog.handler'
import { UpdateBlogCommand } from '../application/use-cases/commands/update-blog.handler'
import { DeleteBlogCommand } from '../application/use-cases/commands/delete-blog.handler'
import { GetPostsByBlogIdQueryPayload } from '../application/use-cases/queries/get-posts-by-blog-id.handler'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { BasicAuthGuard } from '../../../../infrastructure/guards/auth.guard'
import { handleInterlayerResult, InterlayerResult } from '../../../../common/models/result-layer.model'
import { BlogsSqlQueryRepository } from '../infrastructure/blogs.sql-query-repository'
import { DeletePostCommand } from '../application/use-cases/commands/delete-post.handler'
import { UpdatePostInputModel } from './models/input/update-post.input.model'
import { UpdatePostCommand } from '../application/use-cases/commands/update-post.handler'

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateBlogInputModel): Promise<Nullable<PostOutputModel> | void> {
    const result = await this.commandBus.execute<CreateBlogCommand, InterlayerResult<Nullable<PostOutputModel>>>(
      new CreateBlogCommand(body),
    )
    return handleInterlayerResult(result)
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostToBlog(
    @Param('blogId', new ParseUUIDPipe()) blogId: string,
    @Body() body: CreatePostToBlogInputModel,
  ): Promise<PostOutputModel | void> {
    const result = await this.commandBus.execute<CreatePostToBlogCommand, InterlayerResult<Nullable<PostOutputModel>>>(
      new CreatePostToBlogCommand({ ...body, blogId }),
    )
    return handleInterlayerResult(result)
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId', new ParseUUIDPipe()) blogId: string,
    @Body() body: UpdateBlogInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute<UpdateBlogCommand, InterlayerResult>(
      new UpdateBlogCommand({ ...body, blogId }),
    )
    return handleInterlayerResult(result)
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param('blogId', new ParseUUIDPipe()) blogId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Body() body: UpdatePostInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute<UpdatePostCommand, InterlayerResult>(
      new UpdatePostCommand({ ...body, blogId, postId }),
    )
    return handleInterlayerResult(result)
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(
    @Param('blogId', new ParseUUIDPipe()) blogId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute<DeletePostCommand, InterlayerResult>(
      new DeletePostCommand(blogId, postId),
    )
    return handleInterlayerResult(result)
  }

  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('blogId', new ParseUUIDPipe()) blogId: string): Promise<void> {
    const result = await this.commandBus.execute<DeleteBlogCommand, InterlayerResult>(new DeleteBlogCommand(blogId))
    return handleInterlayerResult(result)
  }
}
