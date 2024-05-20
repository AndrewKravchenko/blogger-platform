import { Injectable } from '@nestjs/common'
import { Like, LikeStatus } from '../domain/like.entity'
import { DataSource } from 'typeorm'

@Injectable()
export class LikesSqlRepository {
  constructor(private readonly dataSource: DataSource) {}

  async createPostStatusLike({ postId, userId, myStatus }: Like): Promise<void> {
    const query = `
      INSERT INTO "Like"("postId", "userId", "myStatus")
      VALUES ($1, $2, $3);
    `
    const params = [postId, userId, myStatus]
    await this.dataSource.query(query, params)
  }

  async createCommentStatusLike({ commentId, userId, myStatus }: Like): Promise<void> {
    const query = `
      INSERT INTO "Like"("commentId", "userId", "myStatus")
      VALUES ($1, $2, $3)
    `
    const params = [commentId, userId, myStatus]

    await this.dataSource.query(query, params)
  }

  async updateCommentLikeStatus(commentId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const query = `
      UPDATE "Like"
      SET "myStatus" = $1
      WHERE "commentId" = $2 AND "userId" = $3
    `
    const params = [myStatus, commentId, userId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async updatePostLikeStatus(postId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const query = `
      UPDATE "Like"
      SET "myStatus" = $1
      WHERE "postId" = $2 AND "userId" = $3
    `
    const params = [myStatus, postId, userId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }
}
