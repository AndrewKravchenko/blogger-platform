import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Request } from 'express'
import { CommentsQueryRepository } from '../../features/blogs/comments/infrastructure/comments.query-repository'

@Injectable()
export class CommentOwnershipGuard implements CanActivate {
  constructor(private readonly commentsQueryRepository: CommentsQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const comment = await this.commentsQueryRepository.getCommentById(req.params.commentId)

    if (!comment) {
      throw new NotFoundException()
    }
    if (comment.commentatorInfo.userId !== req.user?.id) {
      throw new ForbiddenException()
    }

    return true
  }
}
