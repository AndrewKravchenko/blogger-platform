import { IsMongoId, IsString, Length } from 'class-validator'
import { Trim } from '../../../../../infrastructure/decorators/transform/trim'

export class BasePostInputModel {
  @Trim()
  @IsString()
  @Length(1, 30)
  title: string

  @Trim()
  @IsString()
  @Length(1, 100)
  shortDescription: string

  @Trim()
  @IsString()
  @Length(1, 1000)
  content: string

  @IsMongoId()
  blogId: string
}
