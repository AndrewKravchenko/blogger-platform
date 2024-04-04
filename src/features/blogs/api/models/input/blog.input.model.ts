import { IsMongoId, IsString, Length, Matches } from 'class-validator'
import { Trim } from '../../../../../infrastructure/decorators/transform/trim'

export class BaseBlogInputModel {
  @IsString()
  @Trim()
  @Length(1, 15)
  name: string

  @IsString()
  @Trim()
  @Length(1, 500)
  description: string

  @IsString()
  @Trim()
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
  websiteUrl: string
}

export class InputBlogIdModel {
  @IsMongoId()
  blogId: string
}
