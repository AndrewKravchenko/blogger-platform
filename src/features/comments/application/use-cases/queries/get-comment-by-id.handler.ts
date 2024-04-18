import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../common/models/result-layer.model'
import { CommentOutputModel } from '../../../api/models/output/comment.output.model'
import { CommentsQueryRepository } from '../../../infrastructure/comments.query-repository'
import { LikesQueryRepository } from '../../../../likes/infrastructure/likes.query-repository'

export class GetCommentByIdQueryPayload {
  constructor(
    public commentId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQueryPayload)
export class GetCommentByIdHandler implements IQueryHandler<GetCommentByIdQueryPayload> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async execute({
    commentId,
    userId,
  }: GetCommentByIdQueryPayload): Promise<InterlayerResult<Nullable<CommentOutputModel>>> {
    const comment = await this.commentsQueryRepository.getCommentById(commentId)

    if (!comment) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const myStatus = await this.likesQueryRepository.getCommentLikeStatus(commentId, userId)

    return InterlayerResult.Ok(CommentOutputModel.addUserStatus(comment, myStatus))
  }
}
