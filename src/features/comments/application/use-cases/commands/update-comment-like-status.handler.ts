import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../common/models/result-layer.model'
import { LikeStatus } from '../../../../likes/domain/like.entity'
import { LikesService } from '../../../../likes/application/likes.service'
import { LikesQueryRepository } from '../../../../likes/infrastructure/likes.query-repository'
import { CommentsQueryRepository } from '../../../infrastructure/comments.query-repository'
import { CommentsRepository } from '../../../infrastructure/comments.repository'

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public newLikeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusHandler
  implements ICommandHandler<UpdateCommentLikeStatusCommand, InterlayerResult>
{
  constructor(
    private readonly likesService: LikesService,
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute({ commentId, userId, newLikeStatus }: UpdateCommentLikeStatusCommand): Promise<InterlayerResult> {
    const comment = await this.commentsQueryRepository.getCommentById(commentId)

    if (!comment) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const currentLikeStatus = await this.likesQueryRepository.getCommentLikeStatus(commentId, userId)

    if (currentLikeStatus === newLikeStatus) {
      return InterlayerResult.Ok()
    }

    await this.updateLikesCount(commentId, currentLikeStatus || LikeStatus.None, newLikeStatus)

    if (currentLikeStatus) {
      await this.likesService.updateCommentLikeStatus(commentId, userId, newLikeStatus)
    } else {
      await this.likesService.createCommentLikeStatus(commentId, userId, newLikeStatus)
    }

    return InterlayerResult.Ok()
  }

  private async updateLikesCount(
    commentId: string,
    currentLikeStatus: LikeStatus,
    newLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const likesCountUpdate = this.likesService.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)

    return await this.commentsRepository.updateLikesCount(commentId, likesCountUpdate)
  }
}
