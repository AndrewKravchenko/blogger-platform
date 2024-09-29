import { Injectable } from '@nestjs/common'
import { LikeStatus } from '../domain/like.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Like } from '../domain/like.sql-entity'

@Injectable()
export class LikesSqlQueryRepository {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async getPostLikeStatus(postId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    const like = await this.likesRepository
      .createQueryBuilder()
      .select()
      .where('"postId" = :postId', { postId })
      .andWhere('"userId" = :userId', { userId })
      .getOne()

    if (!like) {
      return null
    }

    return like.myStatus
  }

  async getCommentLikeStatus(commentId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    const likeStatus = await this.likesRepository
      .createQueryBuilder()
      .select()
      .where('"commentId" = :commentId', { commentId })
      .andWhere('"userId" = :userId', { userId })
      .getOne()

    if (!likeStatus) {
      return null
    }

    return likeStatus.myStatus
  }
}
