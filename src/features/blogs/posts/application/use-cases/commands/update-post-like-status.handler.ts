import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { LikeStatus } from '../../../../likes/domain/like.entity'
import { LikesService } from '../../../../likes/application/likes.service'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { LikesSqlQueryRepository } from '../../../../likes/infrastructure/likes.sql-query-repository'
import { PostsSqlQueryRepository } from '../../../infrastructure/posts.sql-query-repository'
import { PostsSqlRepository } from '../../../infrastructure/posts.sql-repository'

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public newLikeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusHandler implements ICommandHandler<UpdatePostLikeStatusCommand, InterlayerResult> {
  constructor(
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly likesService: LikesService,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly likesQueryRepository: LikesSqlQueryRepository,
  ) {}

  async execute({ postId, userId, newLikeStatus }: UpdatePostLikeStatusCommand): Promise<InterlayerResult> {
    const post = await this.postsSqlQueryRepository.getPostById(postId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const myStatus = await this.likesQueryRepository.getPostLikeStatus(postId, userId)
    if (myStatus === newLikeStatus) {
      return InterlayerResult.Ok()
    }

    await this.updateLikesCount(postId, myStatus || LikeStatus.None, newLikeStatus)

    if (myStatus) {
      await this.likesService.updatePostLikeStatus(postId, userId, newLikeStatus)
    } else {
      await this.likesService.createPostLikeStatus(postId, userId, newLikeStatus)
    }

    return InterlayerResult.Ok()
  }

  private async updateLikesCount(
    postId: string,
    currentLikeStatus: LikeStatus,
    newLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const likeCountChanges = this.likesService.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)

    if (!likeCountChanges) {
      return true
    }

    return await this.postsSqlRepository.updateLikesCount(
      postId,
      likeCountChanges.likesCount,
      likeCountChanges.dislikesCount,
    )
  }
}
