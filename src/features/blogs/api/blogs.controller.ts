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
import { BlogsService } from '../application/blogs.service'
import { QueryBlogInputModel } from './models/input/query-blog.input.model'
import { QueryPostModel } from '../../posts/api/models/input/query-post.input.model'
import { Request } from 'express'
import { PostOutputModel } from '../../posts/api/models/output/post.output.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { UpdateBlogInputModel } from './models/input/update-blog.input.model'
import { ResultCode, throwExceptionByResultCode } from '../../../common/models/result-layer.model'
import { MongoIdPipe } from '../../../infrastructure/pipes/mongo-id.pipe'
import { BasicAuthGuard } from '../../../infrastructure/guards/auth.guard'

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
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
    const { resultCode, data, errorMessages } = await this.blogsService.getPostsByBlogId(query, blogId, req.user?.id)

    if (resultCode === ResultCode.Success && data) {
      return data
    }

    return throwExceptionByResultCode(resultCode, errorMessages)
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createModel: CreateBlogInputModel): Promise<BlogOutputModel> {
    return await this.blogsService.createBlog(createModel)
  }

  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostToBlog(
    @Req() req: Request,
    @Param('blogId', MongoIdPipe) blogId: string,
    @Body() postCreateModel: CreatePostToBlogInputModel,
  ): Promise<PostOutputModel | void> {
    const { resultCode, data, errorMessages } = await this.blogsService.createPostToBlog(
      blogId,
      postCreateModel,
      req.user?.id,
    )

    if (resultCode === ResultCode.Success && data) {
      return data
    }

    return throwExceptionByResultCode(resultCode, errorMessages)
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('blogId', MongoIdPipe) blogId: string,
    @Body() updateModel: UpdateBlogInputModel,
  ): Promise<void> {
    const { resultCode, errorMessages } = await this.blogsService.updateBlog(blogId, updateModel)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('blogId', MongoIdPipe) blogId: string): Promise<void> {
    const { resultCode, errorMessages } = await this.blogsService.deleteBlogById(blogId)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }
}
