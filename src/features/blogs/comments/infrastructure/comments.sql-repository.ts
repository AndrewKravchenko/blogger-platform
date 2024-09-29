import { Injectable } from '@nestjs/common'
import { CommentOutputMapper, CommentOutputModel } from '../api/models/output/comment.output.model'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from '../domain/comment.sql-entity'

@Injectable()
export class CommentsSqlRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async createCommentToPost(postId: string, userId: string, content: string): Promise<CommentOutputModel> {
    const { raw } = await this.commentsRepository
      .createQueryBuilder()
      .insert()
      .values({ postId, userId, content })
      .returning('*')
      .execute()
    return CommentOutputMapper(raw[0])
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    const { affected } = await this.commentsRepository
      .createQueryBuilder()
      .update()
      .set({ content })
      .where('id = :id', { id: commentId })
      .execute()
    return !!affected
  }

  async updateLikesCount(commentId: string, likesCount: number, dislikesCount: number): Promise<boolean> {
    const { affected } = await this.commentsRepository
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => `likesCount + ${likesCount}`,
        dislikesCount: () => `dislikesCount + ${dislikesCount}`,
      })
      .where('id = :id', { id: commentId })
      .execute()
    return !!affected
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const { affected } = await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: commentId })
      .execute()
    return !!affected
  }
}
