import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { CommentsSqlRepository } from '../../../infrastructure/comments.sql-repository'

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand, InterlayerResult> {
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute({ commentId, content }: UpdateCommentCommand): Promise<InterlayerResult> {
    const isUpdated = await this.commentsSqlRepository.updateComment(commentId, content)

    if (isUpdated) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
