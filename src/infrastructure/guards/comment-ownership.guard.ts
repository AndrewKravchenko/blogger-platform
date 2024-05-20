import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Request } from 'express'
import { CommentsSqlQueryRepository } from '../../features/blogs/comments/infrastructure/comments.sql-query-repository'

@Injectable()
export class CommentOwnershipGuard implements CanActivate {
  constructor(private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const comment = await this.commentsSqlQueryRepository.getCommentById(req.params.commentId, req.user?.id)

    if (!comment) {
      throw new NotFoundException()
    }
    if (comment.commentatorInfo.userId !== req.user?.id) {
      throw new ForbiddenException()
    }

    return true
  }
}
