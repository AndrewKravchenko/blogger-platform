import { IsString, Length } from 'class-validator'
import { Trim } from '../../../../../infrastructure/decorators/transform/trim'
import { BaseBlogInputModel } from './blog.input.model'

export class CreateBlogInputModel extends BaseBlogInputModel {}

export class CreatePostToBlogInputModel {
  @IsString()
  @Trim()
  @Length(1, 30)
  title: string

  @IsString()
  @Trim()
  @Length(1, 100)
  shortDescription: string

  @IsString()
  @Trim()
  @Length(1, 1000)
  content: string
}

export class CreateBlogModel {
  name: string
  description: string
  websiteUrl: string
  isMembership: boolean
}
