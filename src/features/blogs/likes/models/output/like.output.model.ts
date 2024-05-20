import { LikeDocument, LikeStatus } from '../../domain/like.entity'

export abstract class LikeOutputBDModel {
  constructor(
    public userId: string,
    public myStatus: LikeStatus,
    public createdAt: string,
  ) {}
}

export class PostLikeOutputModel extends LikeOutputBDModel {
  constructor(
    public userId: string,
    public postId: string,
    public myStatus: LikeStatus,
    public createdAt: string,
  ) {
    super(userId, myStatus, createdAt)
  }
}

export type NewestLikeOutputBDModel = {
  login: string
  userId: string
  createdAt: string
}

export class NewestLikeOutputModel {
  login: string
  userId: string
  addedAt: string

  constructor(login: string, userId: string, addedAt: string) {
    this.login = login
    this.userId = userId
    this.addedAt = addedAt
  }
}

export class ExtendedLikesInfoOutputModel {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
    public myStatus: LikeStatus | null,
    public newestLikes: NewestLikeOutputModel[] | null,
  ) {}
}

// MAPPERS

export const PostLikeOutputMapper = ({ userId, postId, myStatus, createdAt }: LikeDocument): PostLikeOutputModel => {
  return new PostLikeOutputModel(userId, postId || '', myStatus, createdAt)
}
