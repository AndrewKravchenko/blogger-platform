import { LikesCount } from '../../../../likes/domain/like.entity'
import { BasePostInputModel } from './post.input.model'

export class CreatePostInputModel extends BasePostInputModel {}

export class CreatePostModel {
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  extendedLikesInfo?: LikesCount
  createdAt?: string
}
