import { Injectable } from '@nestjs/common'
import { LikesSqlQueryRepository } from '../infrastructure/likes.sql-query-repository'
import { NewestLikeOutputModel } from '../models/output/like.output.model'
import { Like, LikeStatus } from '../domain/like.entity'
import { LikesSqlRepository } from '../infrastructure/likes-sql-repository.service'
import { UsersSqlQueryRepository } from '../../../users/infrastructure/users.sql-query-repository'

export type UpdateLikesCount = {
  likesCount?: number
  dislikesCount?: number
}

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesSqlRepository,
    private readonly likesQueryRepository: LikesSqlQueryRepository,
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  // async getPostNewestLikes(postId: string): Promise<NewestLikeOutputModel[] | null> {
  //   const newestLikes = await this.likesQueryRepository.getPostNewestLikes(postId)
  //
  //   if (!newestLikes) {
  //     return null
  //   }
  //
  //   return Promise.all(
  //     newestLikes.map(async ({ userId, createdAt }) => {
  //       const user = await this.usersSqlQueryRepository.getUserById(userId)
  //
  //       return new NewestLikeOutputModel(user?.login, userId, createdAt)
  //     }),
  //   )
  // }

  async createPostLikeStatus(postId: string, userId: string, myStatus: LikeStatus): Promise<void> {
    const newLike = new Like({
      postId,
      userId,
      myStatus,
    })

    return await this.likesRepository.createPostStatusLike(newLike)
  }

  async createCommentLikeStatus(commentId: string, userId: string, myStatus: LikeStatus): Promise<void> {
    const newLike = new Like({
      commentId,
      userId,
      myStatus,
    })

    return await this.likesRepository.createCommentStatusLike(newLike)
  }

  async updateCommentLikeStatus(commentId: string, userId: string, newLikeStatus: LikeStatus): Promise<boolean> {
    return await this.likesRepository.updateCommentLikeStatus(commentId, userId, newLikeStatus)
  }

  async updatePostLikeStatus(postId: string, userId: string, newLikeStatus: LikeStatus): Promise<boolean> {
    return await this.likesRepository.updatePostLikeStatus(postId, userId, newLikeStatus)
  }

  calculateLikesCountChanges(currentLikeStatus: LikeStatus, newLikeStatus: LikeStatus): UpdateLikesCount | null {
    const likeCountUpdate: UpdateLikesCount = {}
    console.log(`${currentLikeStatus}-${newLikeStatus}`)
    switch (`${currentLikeStatus}-${newLikeStatus}`) {
      case `${LikeStatus.None}-${LikeStatus.Like}`:
        likeCountUpdate.likesCount = 1
        break
      case `${LikeStatus.None}-${LikeStatus.Dislike}`:
        likeCountUpdate.dislikesCount = 1
        break
      case `${LikeStatus.Like}-${LikeStatus.Dislike}`:
        likeCountUpdate.likesCount = -1
        likeCountUpdate.dislikesCount = 1
        break
      case `${LikeStatus.Like}-${LikeStatus.None}`:
        likeCountUpdate.likesCount = -1
        break
      case `${LikeStatus.Dislike}-${LikeStatus.Like}`:
        likeCountUpdate.dislikesCount = -1
        likeCountUpdate.likesCount = 1
        break
      case `${LikeStatus.Dislike}-${LikeStatus.None}`:
        likeCountUpdate.dislikesCount = -1
        break
      default:
        return null
    }

    return likeCountUpdate
  }
}
