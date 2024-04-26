import { BasePostInputModel } from './post.input.model'
import { Trim } from '../../../../../../infrastructure/decorators/transform/trim'
import { IsEnum, IsString } from 'class-validator'
import { LikeStatus } from '../../../../likes/domain/like.entity'

export class UpdatePostInputModel extends BasePostInputModel {}

export class UpdatePostLikeStatusInputModel {
  @Trim()
  @IsString()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus
}
