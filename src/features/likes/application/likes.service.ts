import { Injectable } from '@nestjs/common'
import { LikesQueryRepository } from '../infrastructure/likes.query-repository'
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository'
import { NewestLikeOutputModel } from '../models/output/like.output.model'
import { Like, LikeStatus } from '../domain/like.entity'
import { LikesRepository } from '../infrastructure/likes.repository'

export type UpdateLikesCount = {
  likesCount?: number
  dislikesCount?: number
}

@Injectable()
export class LikesService {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async getPostNewestLikes(postId: string): Promise<NewestLikeOutputModel[] | null> {
    const newestLikes = await this.likesQueryRepository.getPostNewestLikes(postId)

    if (!newestLikes) {
      return null
    }

    return Promise.all(
      newestLikes.map(async ({ userId, createdAt }) => {
        const user = await this.usersQueryRepository.getUserById(userId)

        return new NewestLikeOutputModel(user?.login, userId, createdAt)
      }),
    )
  }

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

  calculateLikesCountChanges(currentLikeStatus: LikeStatus, newLikeStatus: LikeStatus): Record<string, number> {
    const likeCountUpdate: UpdateLikesCount = {}

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
    }

    return likeCountUpdate
  }
}
