import { PostDocument } from '../../../domain/post.entity'
import { LikesCount } from '../../../../likes/domain/like.entity'
import { ExtendedLikesInfoOutputModel } from '../../../../likes/models/output/like.output.model'

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
