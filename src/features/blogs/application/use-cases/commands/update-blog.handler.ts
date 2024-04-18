import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BlogsRepository } from '../../../infrastructure/blogs.repository'
import { InterlayerResult, InterlayerResultCode } from '../../../../../common/models/result-layer.model'

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
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<InterlayerResult> {
    const { blogId, ...updatedBlog } = command
    const isUpdated = await this.blogsRepository.updateBlog(blogId, updatedBlog)

    if (isUpdated) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
