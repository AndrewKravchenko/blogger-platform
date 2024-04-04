import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Post } from '../domain/post.entity'
import { CreatePostModel } from '../api/models/input/create-post.input.model'
import { ObjectId } from 'mongodb'
import { PostOutputDataBaseMapper, PostOutputModel } from '../api/models/output/post.output.model'
import { UpdatePostInputModel } from '../api/models/input/update-post.input.model'

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  public async create(post: CreatePostModel): Promise<PostOutputModel> {
    const createdPost = await this.postModel.create(post)
    return PostOutputDataBaseMapper(createdPost)
  }

  public async updatePost(postId: string, updatedPost: UpdatePostInputModel): Promise<boolean> {
    const result = await this.postModel.updateOne({ _id: new ObjectId(postId) }, { $set: updatedPost })
    return !!result.matchedCount
  }

  public async deletePostById(postId: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({ _id: new ObjectId(postId) })
    return !!result.deletedCount
  }
}
