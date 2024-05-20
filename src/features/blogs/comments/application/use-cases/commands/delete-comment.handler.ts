import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { CommentsSqlRepository } from '../../../infrastructure/comments.sql-repository'

export class DeleteCommentCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand, InterlayerResult> {
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute({ commentId }: DeleteCommentCommand): Promise<InterlayerResult> {
    const isDeleted = await this.commentsSqlRepository.deleteComment(commentId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
