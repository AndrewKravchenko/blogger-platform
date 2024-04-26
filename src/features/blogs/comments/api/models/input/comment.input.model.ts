import { IsMongoId } from 'class-validator'

export class InputCommentId {
  @IsMongoId()
  commentId: string
}
