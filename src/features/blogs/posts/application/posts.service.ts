import { Injectable } from '@nestjs/common'
import { PostOutputModel } from '../api/models/output/post.output.model'
import { LikesSqlQueryRepository } from '../../likes/infrastructure/likes.sql-query-repository'
import { LikeStatus } from '../../likes/domain/like.entity'
import { LikesService } from '../../likes/application/likes.service'

@Injectable()
export class PostsService {
  constructor(
    private readonly likesService: LikesService,
    private readonly likesQueryRepository: LikesSqlQueryRepository,
  ) {}

  async extendPostLikesInfo(post: PostOutputModel, userId?: string): Promise<PostOutputModel> {
    const userLikeStatus = (await this.likesQueryRepository.getPostLikeStatus(post.id, userId)) || LikeStatus.None
    // const newestLikes = await this.likesService.getPostNewestLikes(post.id)
    const newestLikes = []

    return PostOutputModel.extendLikesInfo(post, userLikeStatus, newestLikes)
  }
}
