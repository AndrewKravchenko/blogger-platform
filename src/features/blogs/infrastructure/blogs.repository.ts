import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Blog } from '../domain/blog.entity'
import { ObjectId } from 'mongodb'
import { CreateBlogInputModel } from '../api/models/input/create-blog.input.model'
import { BlogOutputMapper, BlogOutputModel } from '../api/models/output/blog.output.model'
import { UpdateBlogInputModel } from '../api/models/input/update-blog.input.model'

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<Blog>) {}

  async create(blog: CreateBlogInputModel): Promise<BlogOutputModel> {
    const createdBlog = await this.blogModel.create(blog)
    return BlogOutputMapper(createdBlog)
  }

  async updateBlog(blogId: string, updatedBlog: UpdateBlogInputModel): Promise<boolean> {
    const result = await this.blogModel.updateOne({ _id: new ObjectId(blogId) }, { $set: updatedBlog })
    return !!result.matchedCount
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    const result = await this.blogModel.deleteOne({ _id: new ObjectId(blogId) })
    return !!result.deletedCount
  }
}
