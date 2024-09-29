import { Injectable } from '@nestjs/common'
import { CommentOutputMapper, CommentOutputModel } from '../api/models/output/comment.output.model'
import { QueryPostCommentsModel } from '../../posts/api/models/input/query-post.input.model'
import { paginationSkip } from '../../../../infrastructure/utils/queryParams'
import { PaginatedResponse } from '../../../../common/models/common.model'
import { Repository } from 'typeorm'
import { Comment } from '../domain/comment.sql-entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async getPostComments(
    query: QueryPostCommentsModel,
    postId: string,
    userId?: string,
  ): Promise<PaginatedResponse<CommentOutputModel>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query
    const comments = await this.commentsRepository
      .createQueryBuilder('c')
      .select('*')
      .addSelect((subQuery) => {
        return subQuery.select('u.login', 'login').from('User', 'u').where('u.id = c."userId"').limit(1)
      })
      .addSelect((subQuery) => {
        return subQuery
          .select('l."myStatus"')
          .from('Like', 'l')
          .where('l."userId" = :userId', { userId })
          .andWhere('l."commentId" = c.id')
          .limit(1)
      })
      .where('c.postId = :postId', { postId })
      .orderBy(`c.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .take(pageSize)
      .skip(paginationSkip(pageNumber, pageSize))
      .getRawMany()

    const totalCount = await this.commentsRepository
      .createQueryBuilder('c')
      .where('c.postId = :postId', { postId })
      .getCount()

    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments.map(CommentOutputMapper),
    }
  }

  async getCommentById(commentId: string, userId?: string): Promise<CommentOutputModel | null> {
    const comment = await this.commentsRepository
      .createQueryBuilder('c')
      .select('*')
      .addSelect((subQuery) => {
        return subQuery.select('u.login', 'login').from('User', 'u').where('u.id = c."userId"').limit(1)
      })
      .addSelect((subQuery) => {
        return subQuery
          .select('l."myStatus"')
          .from('Like', 'l')
          .where('l."userId" = :userId', { userId })
          .andWhere('l."commentId" = c.id')
          .limit(1)
      })
      .where('c.id = :commentId', { commentId })
      .getRawOne()

    if (!comment) {
      return null
    }

    return CommentOutputMapper(comment)
  }
}
