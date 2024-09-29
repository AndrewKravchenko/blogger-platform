import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { CommentOutputModel } from '../../../api/models/output/comment.output.model'
import { CommentsSqlQueryRepository } from '../../../infrastructure/comments.sql-query-repository'

export class GetCommentByIdQueryPayload {
  constructor(
    public commentId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetCommentByIdQueryPayload)
export class GetCommentByIdHandler implements IQueryHandler<GetCommentByIdQueryPayload> {
  constructor(private readonly commentsSqlQueryRepository: CommentsSqlQueryRepository) {}

  async execute({
    commentId,
    userId,
  }: GetCommentByIdQueryPayload): Promise<InterlayerResult<Nullable<CommentOutputModel>>> {
    const comment = await this.commentsSqlQueryRepository.getCommentById(commentId, userId)

    if (!comment) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    return InterlayerResult.Ok(comment)
  }
}
