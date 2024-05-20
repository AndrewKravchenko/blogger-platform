import { Injectable } from '@nestjs/common'
import { PostOutputDataBaseMapper, PostOutputModel } from '../api/models/output/post.output.model'
import { UpdatePostInputModel } from '../../blogs/api/models/input/update-post.input.model'
import { UpdateLikesCount } from '../../likes/application/likes.service'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { CreatePostModel } from '../domain/post.sql-entity'

@Injectable()
export class PostsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create({ title, content, shortDescription, blogId }: CreatePostModel): Promise<PostOutputModel> {
    const query = `
      INSERT INTO "Post"("title", "content", "shortDescription", "blogId")
      VALUES ($1, $2, $3, $4)
      RETURNING *, (
        SELECT "name" AS "blogName" 
        FROM "Blog" 
        WHERE "id" = $4
    ) AS "blogName"
  `
    const params = [title, content, shortDescription, blogId]

    const [createdPost] = await this.dataSource.query(query, params)
    return PostOutputDataBaseMapper(createdPost)
  }

  async updatePost(postId: string, blogId: string, updatedPost: UpdatePostInputModel): Promise<boolean> {
    const query = `
      UPDATE "Post"
      SET "title" = $1, "content" = $2, "shortDescription" = $3
      WHERE id = $4 AND "blogId" = $5
    `
    const { title, content, shortDescription } = updatedPost
    const params = [title, content, shortDescription, postId, blogId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async updateLikesCount(postId: string, likesCountUpdate: UpdateLikesCount): Promise<boolean> {
    let query = 'UPDATE "Post" SET '
    const params: any = [postId]

    if (likesCountUpdate.likesCount) {
      query += `"likesCount" = "likesCount" + $2`
      params.push(likesCountUpdate.likesCount)
    }
    if (likesCountUpdate.dislikesCount) {
      if (params.length > 1) {
        query += ', '
      }
      query += `"dislikesCount" = "dislikesCount" + $${params.length + 1}`
      params.push(likesCountUpdate.dislikesCount)
    }
    query += ` WHERE id = $1`
    console.log(query, params)
    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async deletePostById(postId: string, blogId: string): Promise<boolean> {
    const query = `
      DELETE FROM "Post"
      WHERE id = $1 AND "blogId" = $2
    `
    const params = [postId, blogId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }
}
