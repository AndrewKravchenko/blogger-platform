import { CommentatorInfo } from '../../../domain/comment.entity'
import { LikesCount, LikeStatus } from '../../../../likes/domain/like.entity'
import { ExtendedLikesInfoOutputModel } from '../../../../likes/models/output/like.output.model'

type CommentOutputProps = {
  id: string
  content: string
  userId: string
  login: string
  likesCount: number
  dislikesCount: number
  myStatus: LikeStatus
  createdAt: string
}

export class CommentOutputModel {
  public id: string
  public content: string
  public createdAt: string
  public commentatorInfo: CommentatorInfo
  public likesInfo: LikesCount | ExtendedLikesInfoOutputModel

  constructor({ id, content, userId, login, likesCount, dislikesCount, myStatus, createdAt }: CommentOutputProps) {
    this.id = id
    this.content = content
    this.createdAt = createdAt

    this.commentatorInfo = { userId, userLogin: login }
    this.likesInfo = { likesCount, dislikesCount, myStatus: myStatus || LikeStatus.None }
  }

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
  userId,
  login,
  likesCount,
  dislikesCount,
  myStatus,
  createdAt,
}: CommentOutputProps): CommentOutputModel => {
  return new CommentOutputModel({ id, content, userId, login, likesCount, dislikesCount, myStatus, createdAt })
}
