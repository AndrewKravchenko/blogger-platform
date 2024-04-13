import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common'
import { InputCommentId } from './models/input/comment.input.model'
import { Request } from 'express'
import { CommentsService } from '../application/comments.service'
import { CommentOutputModel } from './models/output/comment.output.model'
import { UpdateCommentInputModel, UpdateCommentLikeStatusInputModel } from './models/input/update-comment.input.model'
import { BearerAuthGuard } from '../../../infrastructure/guards/auth.guard'
import { CommentOwnershipGuard } from '../../../infrastructure/guards/comment-ownership.guard'
import { ResultCode, throwExceptionByResultCode } from '../../../common/models/result-layer.model'
import { MongoIdPipe } from '../../../infrastructure/pipes/mongo-id.pipe'
import { CurrentUserId } from '../../auth/decorators/current-user-id.param.decorator'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':commentId')
  async getCommentById(
    @Req() req: Request,
    @Param() { commentId }: InputCommentId,
  ): Promise<CommentOutputModel | void> {
    const { resultCode, data } = await this.commentsService.getCommentById(commentId, req.user?.id)

    if (resultCode === ResultCode.Success && data) {
      return data
    }

    return throwExceptionByResultCode(resultCode)
  }

  @UseGuards(BearerAuthGuard, CommentOwnershipGuard)
  @Put(':commentId')
  async updateComment(
    @Param('commentId', MongoIdPipe) commentId: string,
    @Body() { content }: UpdateCommentInputModel,
  ): Promise<CommentOutputModel | void> {
    await this.commentsService.updateComment(commentId, content)
  }

  @UseGuards(BearerAuthGuard)
  @Put(':commentId/like-status')
  async updateLikeStatus(
    @Param('commentId', MongoIdPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() { likeStatus }: UpdateCommentLikeStatusInputModel,
  ): Promise<CommentOutputModel | void> {
    await this.commentsService.updateLikeStatus(currentUserId, commentId, likeStatus)
  }
}
