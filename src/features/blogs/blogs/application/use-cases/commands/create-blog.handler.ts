import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BlogOutputModel } from '../../../api/models/output/blog.output.model'
import { InterlayerResult } from '../../../../../../common/models/result-layer.model'
import { BlogsSqlRepository } from '../../../infrastructure/blogs.sql-repository'

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
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: CreateBlogCommand): Promise<InterlayerResult<BlogOutputModel>> {
    const createdBlog = await this.blogsSqlRepository.create(command)
    return InterlayerResult.Ok(createdBlog)
  }
}
