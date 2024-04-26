import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { LikesCount, LikesCountSchema } from '../../likes/domain/like.entity'
import { getCurrentDateISOString } from '../../../../infrastructure/utils/common'

export type CommentDocument = HydratedDocument<Comment>

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  userLogin: string
}

export const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo)

@Schema()
export class Comment {
  @Prop({ required: true })
  postId: string

  @Prop({ required: true })
  content: string

  @Prop({
    _id: false,
    required: true,
    type: LikesCountSchema,
    default: {
      likesCount: 0,
      dislikesCount: 0,
    },
  })
  likesInfo: LikesCount

  @Prop({ _id: false, required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt?: string

  constructor({ postId, content, commentatorInfo }: Comment) {
    this.postId = postId
    this.content = content
    this.commentatorInfo = commentatorInfo
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
