import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { LikeCreateModel } from '../models/input/create-like.input.model'
import { getCurrentDateISOString } from '../../../utils/common'

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type LikeDocument = HydratedDocument<Like>

@Schema()
export class LikesCount {
  @Prop({ required: true, default: 0 }) likesCount: number
  @Prop({ required: true, default: 0 }) dislikesCount: number
}

export const LikesCountSchema = SchemaFactory.createForClass(LikesCount)

@Schema()
export class Like {
  @Prop({ required: true })
  userId: string

  @Prop()
  commentId?: string

  @Prop()
  postId?: string

  @Prop({ required: true, enum: LikeStatus, default: LikeStatus.None })
  myStatus: LikeStatus

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt: string

  constructor(likeModel: LikeCreateModel) {
    this.userId = likeModel.userId
    this.myStatus = likeModel.myStatus

    if (!likeModel.commentId && !likeModel.postId) {
      throw new Error("Either 'commentId' or 'postId' must be provided")
    }
    if (likeModel.postId) {
      this.postId = likeModel.postId
    }
    if (likeModel.commentId) {
      this.commentId = likeModel.commentId
    }
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like)
