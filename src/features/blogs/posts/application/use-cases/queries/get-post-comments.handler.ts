import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository'
import { CommentsQueryRepository } from '../../../../comments/infrastructure/comments.query-repository'
import { CommentOutputModel } from '../../../../comments/api/models/output/comment.output.model'
import { LikesQueryRepository } from '../../../../likes/infrastructure/likes.query-repository'
import { PaginatedResponse } from '../../../../../../common/models/common.model'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { LikeStatus } from '../../../../likes/domain/like.entity'

export class GetPostCommentsQueryPayload {
  public postId: string
  public userId?: string
  public sortBy: 'createdAt'
  public sortDirection: 'asc' | 'desc'
  public pageNumber: number
  public pageSize: number

  constructor({ postId, userId, sortBy, sortDirection, pageNumber, pageSize }: GetPostCommentsQueryPayload) {
    this.postId = postId
    this.userId = userId
    this.sortBy = sortBy
    this.sortDirection = sortDirection
    this.pageNumber = pageNumber
    this.pageSize = pageSize
  }
}

@QueryHandler(GetPostCommentsQueryPayload)
export class GetPostCommentsHandler implements IQueryHandler<GetPostCommentsQueryPayload> {
  constructor(
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(
    queryPayload: GetPostCommentsQueryPayload,
  ): Promise<InterlayerResult<Nullable<PaginatedResponse<CommentOutputModel>>>> {
    const { postId, userId, ...query } = queryPayload

    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const paginatedComments = await this.commentsQueryRepository.getPostComments(query, postId)
    await Promise.all(paginatedComments.items.map((comment) => this.extendCommentLikesInfo(comment, userId)))

    return InterlayerResult.Ok(paginatedComments)
  }

  async extendCommentLikesInfo(comment: CommentOutputModel, userId?: string): Promise<CommentOutputModel> {
    const userLikeStatus = (await this.likesQueryRepository.getCommentLikeStatus(comment.id, userId)) || LikeStatus.None

    return CommentOutputModel.addUserStatus(comment, userLikeStatus)
  }
}
