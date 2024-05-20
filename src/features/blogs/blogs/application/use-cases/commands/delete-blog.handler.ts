import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository'

export class DeleteBlogCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogHandler implements ICommandHandler<DeleteBlogCommand, InterlayerResult> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute({ blogId }: DeleteBlogCommand): Promise<InterlayerResult> {
    const isDeleted = await this.blogsSqlRepository.deleteBlogById(blogId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
