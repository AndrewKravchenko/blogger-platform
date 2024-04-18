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
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository'
import { CreateBlogInputModel, CreatePostToBlogInputModel } from './models/input/create-blog.input.model'
import { BlogOutputModel } from './models/output/blog.output.model'
import { QueryBlogInputModel } from './models/input/query-blog.input.model'
import { QueryPostModel } from '../../posts/api/models/input/query-post.input.model'
import { Request } from 'express'
import { PostOutputModel } from '../../posts/api/models/output/post.output.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { UpdateBlogInputModel } from './models/input/update-blog.input.model'
import { handleInterlayerResult, InterlayerResult } from '../../../common/models/result-layer.model'
import { MongoIdPipe } from '../../../infrastructure/pipes/mongo-id.pipe'
import { BasicAuthGuard } from '../../../infrastructure/guards/auth.guard'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreateBlogCommand } from '../application/use-cases/commands/create-blog.handler'
import { CreatePostToBlogCommand } from '../application/use-cases/commands/create-post-to-blog.handler'
import { UpdateBlogCommand } from '../application/use-cases/commands/update-blog.handler'
import { DeleteBlogCommand } from '../application/use-cases/commands/delete-blog.handler'
import { GetPostsByBlogIdQueryPayload } from '../application/use-cases/queries/get-posts-by-blog-id.handler'

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async getBlogs(@Query() query: QueryBlogInputModel): Promise<PaginatedResponse<BlogOutputModel>> {
    return await this.blogsQueryRepository.getBlogs(query)
  }

  @Get(':blogId')
  async getBlogById(@Param('blogId', MongoIdPipe) blogId: string): Promise<BlogOutputModel | void> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId)

    if (!blog) {
      throw new NotFoundException()
    }

    return blog
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Req() req: Request,
    @Query() query: QueryPostModel,
    @Param('blogId', MongoIdPipe) blogId: string,
  ): Promise<PaginatedResponse<PostOutputModel> | void> {
    const queryPayload = new GetPostsByBlogIdQueryPayload({ blogId, userId: req.user?.id, ...query })
    const result = await this.queryBus.execute<
      GetPostsByBlogIdQueryPayload,
      InterlayerResult<Nullable<PaginatedResponse<PostOutputModel>>>
    >(queryPayload)

    return handleInterlayerResult(result)
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateBlogInputModel): Promise<Nullable<PostOutputModel> | void> {
    const result = await this.commandBus.execute<CreateBlogCommand, InterlayerResult<Nullable<PostOutputModel>>>(
      new CreateBlogCommand(body),
    )
    return handleInterlayerResult(result)
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostToBlog(
    @Req() req: Request,
    @Param('blogId', MongoIdPipe) blogId: string,
    @Body() body: CreatePostToBlogInputModel,
  ): Promise<PostOutputModel | void> {
    const result = await this.commandBus.execute<CreatePostToBlogCommand, InterlayerResult<Nullable<PostOutputModel>>>(
      new CreatePostToBlogCommand({ ...body, blogId, userId: req.user?.id }),
    )
    return handleInterlayerResult(result)
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('blogId', MongoIdPipe) blogId: string, @Body() body: UpdateBlogInputModel): Promise<void> {
    const result = await this.commandBus.execute<UpdateBlogCommand, InterlayerResult>(
      new UpdateBlogCommand({ ...body, blogId }),
    )
    return handleInterlayerResult(result)
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('blogId', MongoIdPipe) blogId: string): Promise<void> {
    const result = await this.commandBus.execute<DeleteBlogCommand, InterlayerResult>(new DeleteBlogCommand(blogId))
    return handleInterlayerResult(result)
  }
}
