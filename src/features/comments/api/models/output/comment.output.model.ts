import { CommentatorInfo, CommentDocument } from '../../../domain/comment.entity'
import { LikesCount } from '../../../../likes/domain/like.entity'
import { ExtendedLikesInfoOutputModel } from '../../../../likes/models/output/like.output.model'

export class CommentOutputModel {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public likesInfo: LikesCount | ExtendedLikesInfoOutputModel,
    public createdAt: string,
  ) {}
}

// MAPPERS

export const CommentOutputMapper = ({
  id,
  content,
  commentatorInfo,
  likesInfo,
  createdAt,
}: CommentDocument): CommentOutputModel => {
  return new CommentOutputModel(id, content, commentatorInfo, likesInfo, createdAt)
}
