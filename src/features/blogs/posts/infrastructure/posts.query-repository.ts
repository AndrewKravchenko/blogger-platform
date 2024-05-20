import { Injectable } from '@nestjs/common'
import { Post } from '../domain/post.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
// import { PostOutputDataBaseMapper, PostOutputModel } from '../api/models/output/post.output.model'
// import { QueryPostModel } from '../api/models/input/query-post.input.model'
// import { PaginatedResponse } from '../../../../common/models/common.model'
// import { paginationSkip } from '../../../../infrastructure/utils/queryParams'

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  // public async getPosts({
  //   sortBy,
  //   sortDirection,
  //   pageNumber,
  //   pageSize,
  // }: QueryPostModel): Promise<PaginatedResponse<PostOutputModel>> {
  //   const posts = await this.postModel
  //     .find({})
  //     .sort({ [sortBy]: sortDirection })
  //     .skip(paginationSkip(pageNumber, pageSize))
  //     .limit(pageSize)
  //
  //   const totalCount = await this.postModel.countDocuments({})
  //   const pagesCount = Math.ceil(totalCount / pageSize)
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount,
  //     items: posts.map(PostOutputDataBaseMapper),
  //   }
  // }

  // public async getPostsByBlogId(
  //   blogId: string,
  //   postQuery: QueryPostModel,
  // ): Promise<PaginatedResponse<PostOutputModel>> {
  //   const { sortBy, sortDirection, pageNumber, pageSize } = postQuery
  //
  //   const posts = await this.postModel
  //     .find({ blogId })
  //     .sort({ [sortBy]: sortDirection })
  //     .skip(paginationSkip(pageNumber, pageSize))
  //     .limit(pageSize)
  //
  //   const totalCount = await this.postModel.countDocuments({ blogId })
  //   const pagesCount = Math.ceil(totalCount / pageSize)
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount,
  //     items: posts.map(PostOutputDataBaseMapper),
  //   }
  // }
  //
  // public async getPostById(postId: string): Promise<PostOutputModel | null> {
  //   const post = await this.postModel.findById(postId)
  //
  //   if (!post) {
  //     return null
  //   }
  //
  //   return PostOutputDataBaseMapper(post)
  // }
}
