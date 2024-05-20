import { Injectable } from '@nestjs/common'
import { CommentOutputMapper, CommentOutputModel } from '../api/models/output/comment.output.model'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class CommentsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async createCommentToPost(postId: string, userId: string, content: string): Promise<CommentOutputModel> {
    const query = `
      INSERT INTO "Comment" ("postId", "userId", "content")
      VALUES ($1, $2, $3)
      RETURNING *, (SELECT login FROM "User" WHERE "id" = $2)
    `
    const params = [postId, userId, content]

    const [createdComment] = await this.dataSource.query(query, params)
    return CommentOutputMapper(createdComment)
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    const query = `
      UPDATE "Comment"
      SET content = $1
      WHERE id = $2
    `
    const params = [content, commentId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async updateLikesCount(commentId: string, likesCount = 0, dislikesCount = 0): Promise<boolean> {
    console.log(commentId, likesCount, dislikesCount)
    const query = `
      UPDATE "Comment"
      SET "likesCount" = "likesCount" + $1, "dislikesCount" = "dislikesCount" + $2
      WHERE id = $3
    `
    const params = [likesCount, dislikesCount, commentId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async getCommentById(commentId: string): Promise<CommentOutputModel | null> {
    const query = `
      SELECT *
      FROM "Comment"
      WHERE id = $1
    `
    const params = [commentId]

    const [comment] = await this.dataSource.query(query, params)
    return comment
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const query = `
      DELETE FROM "Comment"
      WHERE id = $1
    `
    const params = [commentId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }
}
