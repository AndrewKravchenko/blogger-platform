import { LikeStatus } from '../../domain/like.entity'

export class LikeCreateModel {
  userId: string
  commentId?: string
  postId?: string
  myStatus: LikeStatus
  createdAt?: string
}
