import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { CommentOutputModel } from './models/output/comment.output.model'
import { UpdateCommentInputModel, UpdateCommentLikeStatusInputModel } from './models/input/update-comment.input.model'
import { BearerAuthGuard } from '../../../../infrastructure/guards/auth.guard'
import { CommentOwnershipGuard } from '../../../../infrastructure/guards/comment-ownership.guard'
import { handleInterlayerResult, InterlayerResult } from '../../../../common/models/result-layer.model'
import { CurrentUserId } from '../../../auth/decorators/current-user-id.param.decorator'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/commands/update-comment-like-status.handler'
import { UpdateCommentCommand } from '../application/use-cases/commands/update-comment.handler'
import { GetCommentByIdQueryPayload } from '../application/use-cases/queries/get-comment-by-id.handler'
import { DeleteCommentCommand } from '../application/use-cases/commands/delete-comment.handler'

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':commentId')
  async getCommentById(
    @Req() req: Request,
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
  ): Promise<CommentOutputModel | void> {
    const result = await this.queryBus.execute<GetCommentByIdQueryPayload, InterlayerResult>(
      new GetCommentByIdQueryPayload(commentId, req.user?.id),
    )

    return handleInterlayerResult(result)
  }

  @UseGuards(BearerAuthGuard, CommentOwnershipGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @Body() { content }: UpdateCommentInputModel,
  ): Promise<CommentOutputModel | void> {
    const result = await this.commandBus.execute<UpdateCommentCommand, InterlayerResult>(
      new UpdateCommentCommand(commentId, content),
    )

    return handleInterlayerResult(result)
  }

  @UseGuards(BearerAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('commentId', new ParseUUIDPipe()) commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() { likeStatus }: UpdateCommentLikeStatusInputModel,
  ): Promise<CommentOutputModel | void> {
    const result = await this.commandBus.execute<UpdateCommentLikeStatusCommand, InterlayerResult>(
      new UpdateCommentLikeStatusCommand(commentId, currentUserId, likeStatus),
    )

    return handleInterlayerResult(result)
  }

  @UseGuards(BearerAuthGuard, CommentOwnershipGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('commentId', new ParseUUIDPipe()) commentId: string): Promise<void> {
    const result = await this.commandBus.execute<DeleteCommentCommand, InterlayerResult>(
      new DeleteCommentCommand(commentId),
    )

    return handleInterlayerResult(result)
  }
}
