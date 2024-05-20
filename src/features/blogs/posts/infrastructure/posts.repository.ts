import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Post } from '../domain/post.entity'
import { ObjectId } from 'mongodb'
import { UpdatePostInputModel } from '../api/models/input/update-post.input.model'
import { UpdateLikesCount } from '../../likes/application/likes.service'

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  // async create(post: CreatePostModel): Promise<PostOutputModel> {
  //   const createdPost = await this.postModel.create(post)
  //   return PostOutputDataBaseMapper(createdPost)
  // }

  async updatePost(postId: string, updatedPost: UpdatePostInputModel): Promise<boolean> {
    const result = await this.postModel.updateOne({ _id: new ObjectId(postId) }, { $set: updatedPost })
    return !!result.matchedCount
  }

  async updateLikesCount(postId: string, likesCountUpdate: UpdateLikesCount): Promise<boolean> {
    const likesUpdate: Record<string, any> = {}

    if (likesCountUpdate.likesCount) {
      likesUpdate.$inc = { 'extendedLikesInfo.likesCount': likesCountUpdate.likesCount }
    }
    if (likesCountUpdate.dislikesCount) {
      likesUpdate.$inc = { ...likesUpdate.$inc, 'extendedLikesInfo.dislikesCount': likesCountUpdate.dislikesCount }
    }

    const result = await this.postModel.updateOne({ _id: new ObjectId(postId) }, likesUpdate)

    return !!result.matchedCount
  }

  async deletePostById(postId: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({ _id: new ObjectId(postId) })
    return !!result.deletedCount
  }
}
