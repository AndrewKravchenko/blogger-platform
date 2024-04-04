import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Like, LikeStatus } from '../domain/like.entity'
import { PostLikeOutputMapper, PostLikeOutputModel } from '../models/output/like.output.model'

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}
  public async getUserPostLikeStatus(postId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    const like = await this.likeModel.findById({ postId, userId })

    if (!like) {
      return null
    }

    return like.myStatus
  }

  public async getCommentLikeStatus(commentId: string, userId?: string): Promise<LikeStatus | null> {
    if (!userId) {
      return null
    }

    const like = await this.likeModel.findById({ commentId, userId })

    if (!like) {
      return null
    }

    return like.myStatus
  }

  public async getPostNewestLikes(postId: string): Promise<PostLikeOutputModel[] | null> {
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
