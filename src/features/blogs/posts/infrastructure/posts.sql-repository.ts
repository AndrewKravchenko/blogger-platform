import { Injectable } from '@nestjs/common'
import { PostOutputDataBaseMapper, PostOutputModel } from '../api/models/output/post.output.model'
import { UpdatePostInputModel } from '../../blogs/api/models/input/update-post.input.model'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreatePostModel, Post } from '../domain/post.sql-entity'

@Injectable()
export class PostsSqlRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(postModel: CreatePostModel): Promise<PostOutputModel> {
    const { raw } = await this.postsRepository
      .createQueryBuilder('p')
      .insert()
      .values(postModel)
      .returning(`*, (SELECT "name" FROM "Blog" WHERE "id" = p."blogId") AS "blogName"`)
      .execute()
    return PostOutputDataBaseMapper(raw[0])
  }

  async updatePost(postId: string, blogId: string, updatedPostModel: UpdatePostInputModel): Promise<boolean> {
    const { affected } = await this.postsRepository
      .createQueryBuilder()
      .update()
      .set(updatedPostModel)
      .where('id = :id', { id: postId })
      .andWhere('blogId = :blogId', { blogId })
      .execute()
    return !!affected
  }

  async updateLikesCount(postId: string, likesCount: number, dislikesCount: number): Promise<boolean> {
    const { affected } = await this.postsRepository
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => `likesCount + ${likesCount}`,
        dislikesCount: () => `dislikesCount + ${dislikesCount}`,
      })
      .where('id = :id', { id: postId })
      .execute()
    return !!affected
  }

  async deletePostById(postId: string, blogId: string): Promise<boolean> {
    const { affected } = await this.postsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: postId })
      .andWhere('blogId = :blogId', { blogId })
      .execute()
    return !!affected
  }
}
