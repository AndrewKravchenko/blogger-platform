import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Like, LikeStatus } from '../domain/like.entity'

@Injectable()
export class LikesRepository {
  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async createPostStatusLike(newLike: Like): Promise<void> {
    await this.likeModel.create(newLike)
  }

  async createCommentStatusLike(newLike: Like): Promise<void> {
    await this.likeModel.create(newLike)
  }

  async updateCommentLikeStatus(commentId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const likeStatus = await this.likeModel.updateOne({ commentId, userId }, { myStatus })

    return !!likeStatus.matchedCount
  }

  async updatePostLikeStatus(postId: string, userId: string, myStatus: LikeStatus): Promise<boolean> {
    const likeStatus = await this.likeModel.updateOne({ postId, userId }, { myStatus })
    return !!likeStatus.matchedCount
  }
}
