import { Injectable } from '@nestjs/common'
import { Comment } from '../domain/comment.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
// import { CommentOutputMapper, CommentOutputModel } from '../api/models/output/comment.output.model'
// import { ObjectId } from 'mongodb'
// import { UpdateLikesCount } from '../../likes/application/likes.service'

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) {}

  // async createCommentToPost(newComment: Comment): Promise<CommentOutputModel> {
  //   const comment = await this.commentModel.create(newComment)
  //   return CommentOutputMapper(comment)
  // }
  //
  // async updateComment(commentId: string, content: string): Promise<boolean> {
  //   const result = await this.commentModel.updateOne({ _id: new ObjectId(commentId) }, { $set: { content } })
  //   return !!result.matchedCount
  // }
  //
  // async updateLikesCount(commentId: string, likesCountUpdate: UpdateLikesCount): Promise<boolean> {
  //   const likesUpdate: Record<string, any> = {}
  //
  //   if (likesCountUpdate.likesCount) {
  //     likesUpdate.$inc = { 'likesInfo.likesCount': likesCountUpdate.likesCount }
  //   }
  //   if (likesCountUpdate.dislikesCount) {
  //     likesUpdate.$inc = { ...likesUpdate.$inc, 'likesInfo.dislikesCount': likesCountUpdate.dislikesCount }
  //   }
  //
  //   const result = await this.commentModel.updateOne({ _id: new ObjectId(commentId) }, likesUpdate)
  //
  //   return !!result.matchedCount
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
  //
  // async deleteComment(commentId: string): Promise<boolean> {
  //   const result = await this.commentModel.deleteOne({ _id: new ObjectId(commentId) })
  //   return !!result.deletedCount
  // }
}
