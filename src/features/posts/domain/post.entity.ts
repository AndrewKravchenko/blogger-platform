import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { CreatePostModel } from '../api/models/input/create-post.input.model'
import { LikesCount, LikesCountSchema } from '../../likes/domain/like.entity'
import { getCurrentDateISOString } from '../../../utils/common'

export type PostDocument = HydratedDocument<Post>

@Schema()
export class Post {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  shortDescription: string

  @Prop({ required: true })
  content: string

  @Prop({ required: true })
  blogId: string

  @Prop({ required: true })
  blogName: string

  @Prop({
    _id: false,
    required: true,
    type: LikesCountSchema,
    default: {
      likesCount: 0,
      dislikesCount: 0,
    },
  })
  extendedLikesInfo: LikesCount

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt: string

  constructor(postData: CreatePostModel) {
    this.title = postData.title
    this.shortDescription = postData.shortDescription
    this.content = postData.content
    this.blogId = postData.blogId
    this.blogName = postData.blogName
  }
}

export const PostSchema = SchemaFactory.createForClass(Post)
