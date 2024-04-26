import { LikesCount } from '../../../../likes/domain/like.entity'
import { BasePostInputModel } from './post.input.model'
import { IsString, Length } from 'class-validator'
import { Trim } from '../../../../../../infrastructure/decorators/transform/trim'

export class CreatePostInputModel extends BasePostInputModel {}

export class CreateCommentInputModel {
  @Trim()
  @IsString()
  @Length(20, 300)
  content: string
}

export class CreatePostModel {
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  extendedLikesInfo?: LikesCount
  createdAt?: string
}
