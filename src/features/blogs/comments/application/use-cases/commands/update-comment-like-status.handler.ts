import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { LikeStatus } from '../../../../likes/domain/like.entity'
import { LikesService } from '../../../../likes/application/likes.service'
import { LikesSqlQueryRepository } from '../../../../likes/infrastructure/likes.sql-query-repository'
import { CommentsSqlRepository } from '../../../infrastructure/comments.sql-repository'
import { CommentsSqlQueryRepository } from '../../../infrastructure/comments.sql-query-repository'

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
    private readonly likesQueryRepository: LikesSqlQueryRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository,
  ) {}

  async execute({ commentId, userId, newLikeStatus }: UpdateCommentLikeStatusCommand): Promise<InterlayerResult> {
    const comment = await this.commentsSqlQueryRepository.getCommentById(commentId, userId)

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
    const likeCountChanges = this.likesService.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)

    if (!likeCountChanges) {
      return true
    }

    return await this.commentsSqlRepository.updateLikesCount(
      commentId,
      likeCountChanges.likesCount,
      likeCountChanges.dislikesCount,
    )
  }
}
