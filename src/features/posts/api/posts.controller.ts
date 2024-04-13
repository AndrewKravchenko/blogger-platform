import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CreateCommentInputModel, CreatePostInputModel } from './models/input/create-post.input.model'
import { PostOutputModel } from './models/output/post.output.model'
import { PostsService } from '../application/posts.service'
import { Request } from 'express'
import { QueryPostModel } from './models/input/query-post.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { UpdatePostInputModel, UpdatePostLikeStatusInputModel } from './models/input/update-post.input.model'
import { BasicAuthGuard, BearerAuthGuard } from '../../../infrastructure/guards/auth.guard'
import { CurrentUserId } from '../../auth/decorators/current-user-id.param.decorator'
import { ResultCode, throwExceptionByResultCode } from '../../../common/models/result-layer.model'
import { CommentOutputModel } from '../../comments/api/models/output/comment.output.model'
import { MongoIdPipe } from '../../../infrastructure/pipes/mongo-id.pipe'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(@Req() req: Request, @Query() query: QueryPostModel): Promise<PaginatedResponse<PostOutputModel>> {
    return await this.postsService.getPosts(query, req.user?.id)
  }

  @Get(':postId')
  async getPostById(
    @Req() req: Request,
    @Param('postId', MongoIdPipe) postId: string,
  ): Promise<PostOutputModel | void> {
    const { resultCode, data, errorMessages } = await this.postsService.getPostById(postId, req.user?.id)

    if (resultCode === ResultCode.Success && data) {
      return data
    }

    return throwExceptionByResultCode(resultCode, errorMessages)
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() createModel: CreatePostInputModel): Promise<PostOutputModel | void> {
    const { resultCode, data, errorMessages } = await this.postsService.createPost(createModel)

    if (resultCode === ResultCode.Success && data) {
      return data
    }

    return throwExceptionByResultCode(resultCode, errorMessages)
  }

  @UseGuards(BearerAuthGuard)
  @Post(':postId/comments')
  async createCommentToPost(
    @CurrentUserId() currentUserId: string,
    @Param('postId', MongoIdPipe) postId: string,
    @Body() { content }: CreateCommentInputModel,
  ): Promise<CommentOutputModel | void> {
    const { resultCode, data } = await this.postsService.createCommentToPost(postId, currentUserId, content)

    if (resultCode === ResultCode.Success && data) {
      return data
    }

    return throwExceptionByResultCode(resultCode)
  }

  @UseGuards(BasicAuthGuard)
  @Put(':postId')
  async updatePost(
    @Param('postId', MongoIdPipe) postId: string,
    @Body() updateModel: UpdatePostInputModel,
  ): Promise<PostOutputModel | void> {
    const { resultCode, errorMessages } = await this.postsService.updatePost(postId, updateModel)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @UseGuards(BearerAuthGuard)
  @Put(':postId/like-status')
  async updateLikeStatus(
    @Param('postId', MongoIdPipe) postId: string,
    @CurrentUserId() currentUserId: string,
    @Body() { likeStatus }: UpdatePostLikeStatusInputModel,
  ): Promise<PostOutputModel | void> {
    const { resultCode, errorMessages } = await this.postsService.updateLikeStatus(currentUserId, postId, likeStatus)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('postId', MongoIdPipe) postId: string): Promise<void> {
    const { resultCode, errorMessages } = await this.postsService.deletePostById(postId)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }
}
