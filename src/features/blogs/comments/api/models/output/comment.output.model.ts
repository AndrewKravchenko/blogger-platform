import { CommentatorInfo, CommentDocument } from '../../../domain/comment.entity'
import { LikesCount, LikeStatus } from '../../../../likes/domain/like.entity'
import { ExtendedLikesInfoOutputModel } from '../../../../likes/models/output/like.output.model'

export class CommentOutputModel {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public likesInfo: LikesCount | ExtendedLikesInfoOutputModel,
    public createdAt?: string,
  ) {}

  static addUserStatus(comment: CommentOutputModel, myStatus: LikeStatus | null) {
    comment.likesInfo = {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus,
    }
    return comment
  }
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
