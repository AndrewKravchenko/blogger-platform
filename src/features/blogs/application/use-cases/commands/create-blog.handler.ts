import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BlogsRepository } from '../../../infrastructure/blogs.repository'
import { BlogOutputModel } from '../../../api/models/output/blog.output.model'
import { InterlayerResult } from '../../../../../common/models/result-layer.model'

export class CreateBlogCommand {
  public name: string
  public description: string
  public websiteUrl: string

  constructor({ name, websiteUrl, description }: CreateBlogCommand) {
    this.name = name
    this.websiteUrl = websiteUrl
    this.description = description
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogHandler implements ICommandHandler<CreateBlogCommand, InterlayerResult<BlogOutputModel>> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<InterlayerResult<BlogOutputModel>> {
    const createdBlog = await this.blogsRepository.create(command)
    return InterlayerResult.Ok(createdBlog)
  }
}
