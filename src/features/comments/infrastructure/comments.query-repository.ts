import { Injectable } from '@nestjs/common'
import { Comment } from '../domain/comment.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { CommentOutputMapper, CommentOutputModel } from '../api/models/output/comment.output.model'

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>) {}

  public async getCommentById(commentId: string): Promise<CommentOutputModel | null> {
    const comment = await this.commentModel.findById(commentId)

    if (!comment) {
      return null
    }

    return CommentOutputMapper(comment)
  }
}
