import { Injectable } from '@nestjs/common'
import { LikeStatus } from '../../likes/domain/like.entity'
import { LikesQueryRepository } from '../../likes/infrastructure/likes.query-repository'
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository'
import { CommentOutputModel } from '../api/models/output/comment.output.model'
import { CommentsRepository } from '../infrastructure/comments.repository'
import { Result, ResultCode } from '../../../common/models/result-layer.model'
import { LikesService } from '../../likes/application/likes.service'
import { LikesRepository } from '../../likes/infrastructure/likes.repository'

@Injectable()
export class CommentsService {
  constructor(
    private readonly likesService: LikesService,
    private readonly likesRepository: LikesRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async getCommentById(commentId: string, userId?: string): Promise<Result<CommentOutputModel>> {
    const comment = await this.commentsQueryRepository.getCommentById(commentId)

    if (!comment) {
      return { resultCode: ResultCode.NotFound }
    }

    const myStatus = await this.likesQueryRepository.getCommentLikeStatus(commentId, userId)

    return { resultCode: ResultCode.Success, data: CommentOutputModel.addUserStatus(comment, myStatus) }
  }

  async updatePostLikeStatus(postId: string, userId: string, newLikeStatus: LikeStatus): Promise<boolean> {
    return await this.likesRepository.updatePostLikeStatus(postId, userId, newLikeStatus)
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    return await this.commentsRepository.updateComment(commentId, content)
  }

  async updateLikeStatus(userId: string, commentId: string, newLikeStatus: LikeStatus): Promise<Result> {
    const comment = await this.commentsQueryRepository.getCommentById(commentId)

    if (!comment) {
      return { resultCode: ResultCode.NotFound }
    }

    const currentLikeStatus = await this.likesQueryRepository.getCommentLikeStatus(commentId, userId)

    if (currentLikeStatus === newLikeStatus) {
      return { resultCode: ResultCode.Success }
    }

    await this.updateLikesCount(commentId, currentLikeStatus || LikeStatus.None, newLikeStatus)

    if (currentLikeStatus) {
      await this.likesService.updateCommentLikeStatus(commentId, userId, newLikeStatus)
    } else {
      await this.likesService.createCommentLikeStatus(commentId, userId, newLikeStatus)
    }

    return { resultCode: ResultCode.Success }
  }

  async updateLikesCount(
    commentId: string,
    currentLikeStatus: LikeStatus,
    newLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const likesCountUpdate = this.likesService.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)

    return await this.commentsRepository.updateLikesCount(commentId, likesCountUpdate)
  }
}
