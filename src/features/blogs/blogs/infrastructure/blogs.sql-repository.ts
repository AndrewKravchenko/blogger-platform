import { Injectable } from '@nestjs/common'
import { ObjectId } from 'mongodb'
import { CreateBlogInputModel } from '../api/models/input/create-blog.input.model'
import { BlogOutputMapper, BlogOutputModel } from '../api/models/output/blog.output.model'
import { UpdateBlogInputModel } from '../api/models/input/update-blog.input.model'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class BlogsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create({ name, websiteUrl, description }: CreateBlogInputModel): Promise<BlogOutputModel> {
    const query = `
      INSERT INTO "Blog"("name", "websiteUrl", "description")
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const params = [name, websiteUrl, description]
    const [createdBlog] = await this.dataSource.query(query, params)

    return BlogOutputMapper(createdBlog)
  }

  async updateBlog(blogId: string, updatedBlog: UpdateBlogInputModel): Promise<boolean> {
    const query = `
      UPDATE "Blog"
      SET "name" = $1, "websiteUrl" = $2, "description" = $3
      WHERE "id" = $4
    `
    const { name, websiteUrl, description } = updatedBlog
    const params = [name, websiteUrl, description, blogId]

    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    const query = `
      DELETE FROM "Blog"
      WHERE id = $1
    `
    const params = [blogId]
    const [, affectedRows] = await this.dataSource.query(query, params)
    return !!affectedRows
  }
}
