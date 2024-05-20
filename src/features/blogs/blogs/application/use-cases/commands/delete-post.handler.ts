import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { PostsSqlRepository } from '../../../../posts/infrastructure/posts.sql-repository'

export class DeletePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand, InterlayerResult> {
  constructor(private readonly postsSqlRepository: PostsSqlRepository) {}

  async execute({ postId, blogId }: DeletePostCommand): Promise<InterlayerResult> {
    const isDeleted = await this.postsSqlRepository.deletePostById(postId, blogId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
