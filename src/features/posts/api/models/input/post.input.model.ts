import { IsMongoId, IsString, Length } from 'class-validator'
import { Trim } from '../../../../../infrastructure/decorators/transform/trim'

export class BasePostInputModel {
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

  @IsMongoId()
  blogId: string
}

export class InputPostId {
  @IsMongoId()
  postId: string
}
