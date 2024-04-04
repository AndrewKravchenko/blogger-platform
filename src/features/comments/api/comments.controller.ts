import { Controller, Get, NotFoundException, Param, Req } from '@nestjs/common'
import { InputCommentId } from './models/input/comment.input.model'
import { Request } from 'express'
import { CommentsService } from '../application/comments.service'
import { CommentOutputModel } from './models/output/comment.output.model'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':commentId')
  async getCommentById(
    @Req() req: Request,
    @Param() { commentId }: InputCommentId,
  ): Promise<CommentOutputModel | void> {
    const comment = await this.commentsService.getCommentById(commentId, req.userId)

    if (!comment) {
      throw new NotFoundException()
    }

    return comment
  }
}
