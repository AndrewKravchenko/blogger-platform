import { Injectable } from '@nestjs/common'
import { CreateBlogInputModel } from '../api/models/input/create-blog.input.model'
import { BlogOutputMapper, BlogOutputModel } from '../api/models/output/blog.output.model'
import { UpdateBlogInputModel } from '../api/models/input/update-blog.input.model'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Blog } from '../domain/blog.sql-entity'

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async create(blogModel: CreateBlogInputModel): Promise<BlogOutputModel> {
    const { raw } = await this.blogsRepository.createQueryBuilder().insert().values(blogModel).returning('*').execute()

    return BlogOutputMapper(raw[0])
  }

  async updateBlog(blogId: string, updatedBlogModel: UpdateBlogInputModel): Promise<boolean> {
    const { affected } = await this.blogsRepository
      .createQueryBuilder()
      .update()
      .set(updatedBlogModel)
      .where('id = :id', { id: blogId })
      .execute()
    return !!affected
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    const { affected } = await this.blogsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: blogId })
      .execute()
    return !!affected
  }
}
