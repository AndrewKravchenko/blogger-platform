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
import { InputBlogIdModel } from './models/input/blog.input.model'

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
  async getBlogById(@Param() { blogId }: InputBlogIdModel): Promise<BlogOutputModel | void> {
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
    @Param() { blogId }: InputBlogIdModel,
  ): Promise<PaginatedResponse<PostOutputModel> | void> {
    const posts = await this.blogsService.getPostsByBlogId(query, blogId, req.userId)

    if (!posts) {
      throw new NotFoundException()
    }

    return posts
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createModel: CreateBlogInputModel): Promise<BlogOutputModel> {
    return await this.blogsService.createBlog(createModel)
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostToBlog(
    @Req() req: Request,
    @Param() { blogId }: InputBlogIdModel,
    @Body() postCreateModel: CreatePostToBlogInputModel,
  ): Promise<PostOutputModel | void> {
    const createdPost = await this.blogsService.createPostToBlog(blogId, postCreateModel, req.userId)

    if (!createdPost) {
      throw new NotFoundException()
    }

    return createdPost
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param() { blogId }: InputBlogIdModel, @Body() updateModel: UpdateBlogInputModel): Promise<void> {
    const isUpdated = await this.blogsService.updateBlog(blogId, updateModel)

    if (!isUpdated) {
      throw new NotFoundException()
    }
  }

  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() { blogId }: InputBlogIdModel): Promise<void> {
    const isDeleted = await this.blogsService.deleteBlogById(blogId)

    if (!isDeleted) {
      throw new NotFoundException()
    }
  }
}
