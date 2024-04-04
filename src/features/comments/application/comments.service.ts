import { Injectable } from '@nestjs/common'
import { LikeStatus } from '../../likes/domain/like.entity'
import { LikesQueryRepository } from '../../likes/infrastructure/likes.query-repository'
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository'
import { CommentOutputModel } from '../api/models/output/comment.output.model'
import { LikesInfoOutputModel } from '../../likes/models/output/like.output.model'

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async getCommentById(commentId: string, userId?: string): Promise<CommentOutputModel | null> {
    const comment = await this.commentsQueryRepository.getCommentById(commentId)

    if (!comment) {
      return null
    }

    const myStatus = (await this.likesQueryRepository.getCommentLikeStatus(commentId, userId)) || LikeStatus.None
    comment.likesInfo = new LikesInfoOutputModel(
      comment.likesInfo.likesCount,
      comment.likesInfo.dislikesCount,
      myStatus,
    )

    return comment
  }
}
