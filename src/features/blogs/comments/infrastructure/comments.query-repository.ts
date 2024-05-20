import { Injectable } from '@nestjs/common'
import { Comment } from '../domain/comment.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
// import { CommentOutputMapper, CommentOutputModel } from '../api/models/output/comment.output.model'
// import { QueryPostCommentsModel } from '../../posts/api/models/input/query-post.input.model'
// import { paginationSkip } from '../../../../infrastructure/utils/queryParams'
// import { PaginatedResponse } from '../../../../common/models/common.model'

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) {}

  // async getPostComments(query: QueryPostCommentsModel, postId: string): Promise<PaginatedResponse<CommentOutputModel>> {
  //   const { sortBy, sortDirection, pageNumber, pageSize } = query
  //
  //   const comments = await this.commentModel
  //     .find({ postId })
  //     .sort({ [sortBy]: sortDirection })
  //     .skip(paginationSkip(pageNumber, pageSize))
  //     .limit(pageSize)
  //
  //   const totalCount = await this.commentModel.countDocuments({ postId })
  //   const pagesCount = Math.ceil(totalCount / pageSize)
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount,
  //     items: comments.map(CommentOutputMapper),
  //   }
  // }
  //
  // async getCommentById(commentId: string): Promise<CommentOutputModel | null> {
  //   const comment = await this.commentModel.findById(commentId)
  //
  //   if (!comment) {
  //     return null
  //   }
  //
  //   return CommentOutputMapper(comment)
  // }
}
