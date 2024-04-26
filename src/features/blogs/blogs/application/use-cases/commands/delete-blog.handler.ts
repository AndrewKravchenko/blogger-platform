import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BlogsRepository } from '../../../infrastructure/blogs.repository'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler implements ICommandHandler<DeleteBlogCommand, InterlayerResult> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute({ blogId }: DeleteBlogCommand): Promise<InterlayerResult> {
    const isDeleted = await this.blogsRepository.deleteBlogById(blogId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
