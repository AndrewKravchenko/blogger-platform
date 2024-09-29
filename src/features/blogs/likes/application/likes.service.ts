import { Injectable } from '@nestjs/common'
import { Like, LikeStatus } from '../domain/like.sql-entity'
import { LikesSqlRepository } from '../infrastructure/likes-sql-repository.service'

export type LikeCountChanges = {
  likesCount: number
  dislikesCount: number
}

@Injectable()
export class LikesService {
  constructor(private readonly likesRepository: LikesSqlRepository) {}

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

  calculateLikesCountChanges(currentLikeStatus: LikeStatus, newLikeStatus: LikeStatus): LikeCountChanges | null {
    const likeCountChanges: LikeCountChanges = {
      likesCount: 0,
      dislikesCount: 0,
    }

    switch (`${currentLikeStatus}-${newLikeStatus}`) {
      case `${LikeStatus.None}-${LikeStatus.Like}`:
        likeCountChanges.likesCount = 1
        break
      case `${LikeStatus.None}-${LikeStatus.Dislike}`:
        likeCountChanges.dislikesCount = 1
        break
      case `${LikeStatus.Like}-${LikeStatus.Dislike}`:
        likeCountChanges.likesCount = -1
        likeCountChanges.dislikesCount = 1
        break
      case `${LikeStatus.Like}-${LikeStatus.None}`:
        likeCountChanges.likesCount = -1
        break
      case `${LikeStatus.Dislike}-${LikeStatus.Like}`:
        likeCountChanges.dislikesCount = -1
        likeCountChanges.likesCount = 1
        break
      case `${LikeStatus.Dislike}-${LikeStatus.None}`:
        likeCountChanges.dislikesCount = -1
        break
      default:
        return null
    }

    return likeCountChanges
  }
}
