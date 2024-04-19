import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../common/models/result-layer.model'
import { PostsRepository } from '../../../infrastructure/posts.repository'
import { LikeStatus } from '../../../../likes/domain/like.entity'
import { LikesService } from '../../../../likes/application/likes.service'
import { LikesQueryRepository } from '../../../../likes/infrastructure/likes.query-repository'
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository'

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
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly likesService: LikesService,
    private readonly postsRepository: PostsRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute({ postId, userId, newLikeStatus }: UpdatePostLikeStatusCommand): Promise<InterlayerResult> {
    const post = await this.postsQueryRepository.getPostById(postId)

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
    const likesCountUpdate = this.likesService.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)
    return await this.postsRepository.updateLikesCount(postId, likesCountUpdate)
  }
}
