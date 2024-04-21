import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../common/models/result-layer.model'
import { CommentsRepository } from '../../../infrastructure/comments.repository'

export class DeleteCommentCommand {
  constructor(public commentId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand, InterlayerResult> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({ commentId }: DeleteCommentCommand): Promise<InterlayerResult> {
    const isDeleted = await this.commentsRepository.deleteComment(commentId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
