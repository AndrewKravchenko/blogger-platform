import { Trim } from '../../../../../../infrastructure/decorators/transform/trim'
import { IsString, Length } from 'class-validator'

export class UpdatePostInputModel {
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
}
