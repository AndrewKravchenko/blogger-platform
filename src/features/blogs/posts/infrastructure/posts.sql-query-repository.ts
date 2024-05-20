import { Injectable } from '@nestjs/common'
import { PostOutputDataBaseMapper, PostOutputModel } from '../api/models/output/post.output.model'
import { QueryPostModel } from '../api/models/input/query-post.input.model'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { paginationSkip } from '../../../../infrastructure/utils/queryParams'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { LikeStatus } from '../../likes/domain/like.entity'

@Injectable()
export class PostsSqlQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getPosts(query: QueryPostModel, userId?: string): Promise<PaginatedResponse<PostOutputModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const postsQuery = `
      SELECT p.*, b."name" AS "blogName",
        (
          SELECT json_agg(json_build_object('userId', l."userId", 'createdAt', l."createdAt", 'login', u."login") ORDER BY l."createdAt" DESC)
          FROM (
            SELECT "userId", "createdAt"
            FROM "Like"
            WHERE "postId" = p."id" AND "myStatus" = $4
            ORDER BY "createdAt" DESC
            LIMIT 3
          ) AS l
          JOIN "User" u ON l."userId" = u."id"
        ) AS "newestLikes",
        (
          SELECT "myStatus"
          FROM "Like"
          WHERE "postId" = p."id" AND "userId" = $1
          LIMIT 1
        ) AS "myStatus"
      FROM "Post" p
      JOIN "Blog" b ON p."blogId" = b."id"
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $2
      OFFSET $3;
    `
    const totalCountQuery = `
      SELECT COUNT(*) FROM "Post"
    `
    const params = [userId, pageSize, paginationSkip(pageNumber, pageSize), LikeStatus.Like]

    const posts = await this.dataSource.query(postsQuery, params)
    const [{ count }] = await this.dataSource.query(totalCountQuery)
    const pagesCount = Math.ceil(count / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: +count,
      items: posts.map(PostOutputDataBaseMapper),
    }
  }

  async getPostsByBlogId(
    blogId: string,
    postQuery: QueryPostModel,
    userId?: string,
  ): Promise<PaginatedResponse<PostOutputModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = postQuery
    const postsQuery = `
    SELECT p.*, b."name" AS "blogName",
      (
        SELECT json_agg(json_build_object('userId', l."userId", 'createdAt', l."createdAt", 'login', u."login") ORDER BY l."createdAt" DESC)
        FROM (
          SELECT "userId", "createdAt"
          FROM "Like"
          WHERE "postId" = p."id" AND "myStatus" = $4
          ORDER BY "createdAt" DESC
          LIMIT 3
        ) AS l
        JOIN "User" u ON l."userId" = u."id"
      ) AS "newestLikes",
      (
        SELECT "myStatus"
        FROM "Like"
        WHERE "postId" = p."id" AND "userId" = $5
        LIMIT 1
      ) AS "myStatus"
    FROM "Post" p
    JOIN "Blog" b ON p."blogId" = b."id"
    WHERE p."blogId" = $1
    ORDER BY p."${sortBy}" ${sortDirection}
    LIMIT $2
    OFFSET $3
  `

    const totalCountQuery = `
      SELECT COUNT(*) FROM "Post"
      WHERE "blogId" = $1
    `
    const params = [blogId, pageSize, paginationSkip(pageNumber, pageSize), LikeStatus.Like, userId]

    const posts = await this.dataSource.query(postsQuery, params)

    const [{ count }] = await this.dataSource.query(totalCountQuery, [blogId])
    const pagesCount = Math.ceil(count / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount: +count,
      items: posts.map(PostOutputDataBaseMapper),
    }
  }

  public async getPostById(postId: string, userId?: string): Promise<PostOutputModel | null> {
    const query = `
      SELECT p.*, b."name" AS "blogName",
        (
          SELECT json_agg(json_build_object('userId', l."userId", 'createdAt', l."createdAt", 'login', u."login") ORDER BY l."createdAt" DESC)
          FROM (
            SELECT "userId", "createdAt"
            FROM "Like"
            WHERE "postId" = p."id" AND "myStatus" = $2
            ORDER BY "createdAt" DESC
            LIMIT 3
          ) AS l
          JOIN "User" u ON l."userId" = u."id"
        ) AS "newestLikes",
        (
          SELECT "myStatus"
          FROM "Like"
          WHERE "postId" = p."id" AND "userId" = $3
          LIMIT 1
        ) AS "myStatus"
      FROM "Post" p
      JOIN "Blog" b ON p."blogId" = b."id"
      WHERE p."id" = $1;
    `
    const params = [postId, LikeStatus.Like, userId]
    const [post] = await this.dataSource.query(query, params)

    if (!post) {
      return null
    }

    return PostOutputDataBaseMapper(post)
  }
}
