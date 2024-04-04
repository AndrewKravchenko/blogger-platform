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
import { CreatePostInputModel } from './models/input/create-post.input.model'
import { PostOutputModel } from './models/output/post.output.model'
import { PostsService } from '../application/posts.service'
import { Request } from 'express'
import { QueryPostModel } from './models/input/query-post.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { InputPostId } from './models/input/post.input.model'
import { UpdatePostInputModel } from './models/input/update-post.input.model'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(@Req() req: Request, @Query() query: QueryPostModel): Promise<PaginatedResponse<PostOutputModel>> {
    return await this.postsService.getPosts(query, req.userId)
  }

  @Get(':postId')
  async getPostById(@Req() req: Request, @Param() { postId }: InputPostId): Promise<PostOutputModel | void> {
    const post = await this.postsService.getPostById(postId, req.userId)

    if (!post) {
      throw new NotFoundException()
    }

    return post
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: Request, @Body() createModel: CreatePostInputModel): Promise<PostOutputModel | void> {
    const createdPost = await this.postsService.createPost(createModel)

    if (!createdPost) {
      throw new NotFoundException()
    }

    return createdPost
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() { postId }: InputPostId,
    @Body() updateModel: UpdatePostInputModel,
  ): Promise<PostOutputModel | void> {
    const isUpdated = await this.postsService.updatePost(postId, updateModel)

    if (!isUpdated) {
      throw new NotFoundException()
    }
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() { postId }: InputPostId): Promise<void> {
    const isDeleted = await this.postsService.deletePostById(postId)

    if (!isDeleted) {
      throw new NotFoundException()
    }
  }
}
