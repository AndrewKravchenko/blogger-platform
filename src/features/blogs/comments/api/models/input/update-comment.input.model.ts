import { IsEnum, IsString, Length } from 'class-validator'
import { Trim } from '../../../../../../infrastructure/decorators/transform/trim'
import { LikeStatus } from '../../../../likes/domain/like.entity'

export class UpdateCommentInputModel {
  @Trim()
  @IsString()
  @Length(20, 300)
  content: string
}

export class UpdateCommentLikeStatusInputModel {
  @Trim()
  @IsString()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus
}
