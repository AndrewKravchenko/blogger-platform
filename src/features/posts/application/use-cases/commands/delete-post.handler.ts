import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../common/models/result-layer.model'
import { PostsRepository } from '../../../infrastructure/posts.repository'

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand, InterlayerResult> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute({ postId }: DeletePostCommand): Promise<InterlayerResult> {
    const isDeleted = await this.postsRepository.deletePostById(postId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
