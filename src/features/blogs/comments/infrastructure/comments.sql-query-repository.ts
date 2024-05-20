import { Injectable } from '@nestjs/common'
import { CommentOutputMapper, CommentOutputModel } from '../api/models/output/comment.output.model'
import { QueryPostCommentsModel } from '../../posts/api/models/input/query-post.input.model'
import { paginationSkip } from '../../../../infrastructure/utils/queryParams'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { DataSource } from 'typeorm'

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getPostComments(
    query: QueryPostCommentsModel,
    postId: string,
    userId?: string,
  ): Promise<PaginatedResponse<CommentOutputModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query
    const queryComments = `
      SELECT c.*, (
        SELECT "login"
        FROM "User"
        WHERE id = c."userId"
        LIMIT 1
      ),
      (
        SELECT "myStatus"
        FROM "Like"
        WHERE "commentId" = c."id" AND "userId" = $4
        LIMIT 1
      ) AS "myStatus"
      FROM "Comment" c
      WHERE "postId" = $1
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $2
      OFFSET $3
    `
    const totalCountQuery = `
      SELECT COUNT(*)
      FROM "Comment"
      WHERE "postId" = $1
    `
    const params = [postId, pageSize, paginationSkip(pageNumber, pageSize), userId]

    const comments = await this.dataSource.query(queryComments, params)

    const [{ count }] = await this.dataSource.query(totalCountQuery, [postId])
    const pagesCount = Math.ceil(count / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: +count,
      items: comments.map(CommentOutputMapper),
    }
  }

  async getCommentById(commentId: string, userId?: string): Promise<CommentOutputModel | null> {
    const query = `
      SELECT c.*, u.login, l."myStatus"          
      FROM "Comment" c
      JOIN "User" u ON u.id = c."userId"
      LEFT JOIN "Like" l ON l."userId" = $2 AND l."commentId" = c.id
      WHERE c.id = $1
    `
    const [comment] = await this.dataSource.query(query, [commentId, userId])

    if (!comment) {
      return null
    }

    return CommentOutputMapper(comment)
  }
}
