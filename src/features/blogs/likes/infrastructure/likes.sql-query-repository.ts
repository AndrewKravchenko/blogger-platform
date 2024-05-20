import { Injectable } from '@nestjs/common'
import { LikeStatus } from '../domain/like.entity'
import { PostLikeOutputMapper, PostLikeOutputModel } from '../models/output/like.output.model'
import { DataSource } from 'typeorm'

@Injectable()
export class LikesSqlQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getPostLikeStatus(postId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    const query = `
      SELECT "myStatus"
      FROM "Like"
      WHERE "postId" = $1 AND "userId" = $2
    `
    const params = [postId, userId]

    const [likeStatus] = await this.dataSource.query(query, params)

    if (!likeStatus) {
      return null
    }

    return likeStatus.myStatus
  }

  async getCommentLikeStatus(commentId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    const query = `
      SELECT "myStatus"
      FROM "Like"
      WHERE "commentId" = $1 AND "userId" = $2
    `
    const params = [commentId, userId]

    const [likeStatus] = await this.dataSource.query(query, params)

    if (!likeStatus) {
      return null
    }

    return likeStatus.myStatus
  }

  async getPostNewestLikes(postId: string): Promise<PostLikeOutputModel[] | null> {
    const query = `
      SELECT *
      FROM "Like"
      WHERE "postId" = $1 AND "myStatus" = $2
      ORDER BY "createdAt" ASC
      LIMIT 3
    `
    const params = [postId, LikeStatus.Like]
    const [newestLikes] = await this.dataSource.query(query, params)

    if (!newestLikes) {
      return null
    }

    return newestLikes.map(PostLikeOutputMapper)
  }
}
