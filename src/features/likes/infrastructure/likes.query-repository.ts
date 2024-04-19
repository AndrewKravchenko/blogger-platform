import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Like, LikeStatus } from '../domain/like.entity'
import { PostLikeOutputMapper, PostLikeOutputModel } from '../models/output/like.output.model'

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async getPostLikeStatus(postId: string, userId: string): Promise<LikeStatus | null> {
    const likeStatus = await this.likeModel.findOne({ postId, userId })

    if (!likeStatus) {
      return null
    }

    return likeStatus.myStatus
  }

  async getUserPostLikeStatus(postId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    const like = await this.likeModel.findOne({ postId, userId })

    if (!like) {
      return null
    }

    return like.myStatus
  }

  async getCommentLikeStatus(commentId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }
    const like = await this.likeModel.findOne({ commentId, userId })

    if (!like) {
      return null
    }

    return like.myStatus
  }

  async getPostNewestLikes(postId: string): Promise<PostLikeOutputModel[] | null> {
    const newestLikes = await this.likeModel
      .find({ postId, myStatus: LikeStatus.Like })
      .sort({ createdAt: -1 })
      .limit(3)

    if (!newestLikes) {
      return null
    }

    return newestLikes.map(PostLikeOutputMapper)
  }
}
