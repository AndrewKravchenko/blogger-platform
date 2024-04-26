import { PostDocument } from '../../../domain/post.entity'
import { LikesCount, LikeStatus } from '../../../../likes/domain/like.entity'
import { ExtendedLikesInfoOutputModel, NewestLikeOutputModel } from '../../../../likes/models/output/like.output.model'

export class PostOutputModel {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public extendedLikesInfo: LikesCount | ExtendedLikesInfoOutputModel,
    public createdAt: string,
  ) {}

  static extendLikesInfo(post: PostOutputModel, myStatus: LikeStatus, newestLikes: Nullable<NewestLikeOutputModel[]>) {
    post.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      newestLikes,
      myStatus,
    }
    return post
  }
}

// MAPPERS

export const PostOutputDataBaseMapper = ({
  id,
  title,
  shortDescription,
  content,
  blogId,
  blogName,
  extendedLikesInfo,
  createdAt,
}: PostDocument): PostOutputModel => {
  return new PostOutputModel(id, title, shortDescription, content, blogId, blogName, extendedLikesInfo, createdAt)
}
