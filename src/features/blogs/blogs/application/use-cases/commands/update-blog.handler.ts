import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository'

export class UpdateBlogCommand {
  public blogId: string
  public name: string
  public description: string
  public websiteUrl: string

  constructor({ blogId, name, websiteUrl, description }: UpdateBlogCommand) {
    this.blogId = blogId
    this.name = name
    this.websiteUrl = websiteUrl
    this.description = description
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogHandler implements ICommandHandler<UpdateBlogCommand, InterlayerResult> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: UpdateBlogCommand): Promise<InterlayerResult> {
    const { blogId, ...updatedBlog } = command
    const isUpdated = await this.blogsSqlRepository.updateBlog(blogId, updatedBlog)

    if (isUpdated) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
