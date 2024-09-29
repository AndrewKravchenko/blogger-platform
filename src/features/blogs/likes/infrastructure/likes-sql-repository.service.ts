import { Injectable } from '@nestjs/common'
import { Like, LikeStatus } from '../domain/like.sql-entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class LikesSqlRepository {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
  ) {}

  async createPostStatusLike(likeModel: Like): Promise<void> {
    await this.likesRepository.createQueryBuilder().insert().values(likeModel).execute()
  }

  async createCommentStatusLike(likeModel: Like): Promise<void> {
    await this.likesRepository
      .createQueryBuilder()
      .insert()
      .values({ userId: likeModel.userId, commentId: likeModel.commentId, myStatus: likeModel.myStatus })
      .execute()
  }

  async updateCommentLikeStatus(commentId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const { affected } = await this.likesRepository
      .createQueryBuilder()
      .update()
      .set({ myStatus })
      .where('"commentId" = :commentId', { commentId })
      .andWhere('"userId" = :userId', { userId })
      .execute()
    return !!affected
  }

  async updatePostLikeStatus(postId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const { affected } = await this.likesRepository
      .createQueryBuilder()
      .update()
      .set({ myStatus })
      .where('"postId" = :postId', { postId })
      .andWhere('"userId" = :userId', { userId })
      .execute()
    return !!affected
  }
}
