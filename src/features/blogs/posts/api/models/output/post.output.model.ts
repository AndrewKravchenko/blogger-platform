import { LikeStatus } from '../../../../likes/domain/like.entity'
import {
  ExtendedLikesInfoOutputModel,
  NewestLikeOutputBDModel,
  NewestLikeOutputModel,
} from '../../../../likes/models/output/like.output.model'
import { Post } from '../../../domain/post.sql-entity'

export type PostOutputModelProps = Omit<Post, 'updatedAt'> & {
  blogName: string
  myStatus: LikeStatus
  newestLikes: NewestLikeOutputBDModel[]
}
export type PostWithBlogName = Post & {
  blogName: string
  myStatus: LikeStatus
  newestLikes: NewestLikeOutputBDModel[]
}

export class PostOutputModel {
  public id: string
  public title: string
  public shortDescription: string
  public content: string
  public blogId: string
  public blogName: string
  public extendedLikesInfo: ExtendedLikesInfoOutputModel
  public createdAt: Date
  constructor({
    id,
    title,
    shortDescription,
    content,
    blogId,
    blogName,
    myStatus,
    likesCount,
    dislikesCount,
    newestLikes,
    createdAt,
  }: Omit<PostOutputModelProps, 'blog' | 'comments'>) {
    this.id = id
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
    this.blogId = blogId
    this.blogName = blogName
    this.extendedLikesInfo = {
      myStatus: myStatus || LikeStatus.None,
      likesCount,
      dislikesCount,
      newestLikes: newestLikes?.map(({ login, userId, createdAt }) => ({ login, userId, addedAt: createdAt })) || [],
    }
    this.createdAt = createdAt
  }

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
  myStatus,
  likesCount,
  dislikesCount,
  newestLikes,
  createdAt,
}: PostWithBlogName): PostOutputModel => {
  return new PostOutputModel({
    id,
    title,
    shortDescription,
    content,
    blogId,
    blogName,
    myStatus,
    likesCount,
    dislikesCount,
    newestLikes,
    createdAt,
  })
}
