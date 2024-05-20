import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { CreateCommentInputModel, CreatePostInputModel } from './models/input/create-post.input.model'
import { PostOutputModel } from './models/output/post.output.model'
import { Request } from 'express'
import { QueryPostCommentsModel, QueryPostModel } from './models/input/query-post.input.model'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { UpdatePostLikeStatusInputModel } from './models/input/update-post.input.model'
import { BasicAuthGuard, BearerAuthGuard } from '../../../../infrastructure/guards/auth.guard'
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator'
import { handleInterlayerResult, InterlayerResult } from '../../../../common/models/result-layer.model'
import { CommentOutputModel } from '../../comments/api/models/output/comment.output.model'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { CreatePostCommand } from '../application/use-cases/commands/create-post.handler'
import { UpdatePostLikeStatusCommand } from '../application/use-cases/commands/update-post-like-status.handler'
import { CreateCommentToPostCommand } from '../application/use-cases/commands/create-comment-to-post.handler'
import { GetPostsQueryPayload } from '../application/use-cases/queries/get-posts.handler'
import { GetPostByIdQueryPayload } from '../application/use-cases/queries/get-post-by-id.handler'
import { GetPostCommentsQueryPayload } from '../application/use-cases/queries/get-post-comments.handler'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getPosts(
    @Req() req: Request,
    @Query() query: QueryPostModel,
  ): Promise<InterlayerResult<PaginatedResponse<PostOutputModel>>> {
    const queryPayload = new GetPostsQueryPayload({ userId: req.user?.id, ...query })
    return await this.queryBus.execute<GetPostsQueryPayload, InterlayerResult<PaginatedResponse<PostOutputModel>>>(
      queryPayload,
    )
  }

  @Get(':postId')
  async getPostById(
    @Req() req: Request,
    @Param('postId', new ParseUUIDPipe()) postId: string,
  ): Promise<PostOutputModel | void> {
    const result = await this.queryBus.execute<GetPostByIdQueryPayload, InterlayerResult<Nullable<PostOutputModel>>>(
      new GetPostByIdQueryPayload(postId, req.user?.id),
    )

    return handleInterlayerResult(result)
  }

  @Get(':postId/comments')
  async getPostComments(
    @Req() req: Request,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Query() query: QueryPostCommentsModel,
  ): Promise<PaginatedResponse<CommentOutputModel> | void> {
    const queryPayload = new GetPostCommentsQueryPayload({ postId, userId: req.user?.id, ...query })
    const result = await this.queryBus.execute<
      GetPostCommentsQueryPayload,
      InterlayerResult<Nullable<PaginatedResponse<CommentOutputModel>>>
    >(queryPayload)

    return handleInterlayerResult(result)
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Req() req: Request, @Body() body: CreatePostInputModel): Promise<PostOutputModel | void> {
    const result = await this.commandBus.execute<CreatePostCommand, InterlayerResult>(
      new CreatePostCommand({ ...body, userId: req.user?.id }),
    )

    return handleInterlayerResult(result)
  }

  @UseGuards(BearerAuthGuard)
  @Post(':postId/comments')
  async createCommentToPost(
    @CurrentUserId() currentUserId: string,
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @Body() { content }: CreateCommentInputModel,
  ): Promise<CommentOutputModel | void> {
    const result = await this.commandBus.execute<CreateCommentToPostCommand, InterlayerResult>(
      new CreateCommentToPostCommand(postId, currentUserId, content),
    )

    return handleInterlayerResult(result)
  }

  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async updateLikeStatus(
    @Param('postId', new ParseUUIDPipe()) postId: string,
    @CurrentUserId() currentUserId: string,
    @Body() { likeStatus }: UpdatePostLikeStatusInputModel,
  ): Promise<PostOutputModel | void> {
    const result = await this.commandBus.execute<UpdatePostLikeStatusCommand, InterlayerResult>(
      new UpdatePostLikeStatusCommand(postId, currentUserId, likeStatus),
    )

    return handleInterlayerResult(result)
  }
}
