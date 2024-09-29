import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { PostOutputModel } from '../../../../posts/api/models/output/post.output.model'
import { Post } from '../../../../posts/domain/post.sql-entity'
import { BlogsSqlQueryRepository } from '../../../infrastructure/blogs.sql-query-repository'
import { PostsSqlRepository } from '../../../../posts/infrastructure/posts.sql-repository'

export class CreatePostToBlogCommand {
  public blogId: string
  public title: string
  public shortDescription: string
  public content: string

  constructor({ blogId, title, shortDescription, content }: CreatePostToBlogCommand) {
    this.blogId = blogId
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
  }
}

@CommandHandler(CreatePostToBlogCommand)
export class CreatePostToBlogHandler
  implements ICommandHandler<CreatePostToBlogCommand, InterlayerResult<Nullable<PostOutputModel>>>
{
  constructor(
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
  ) {}

  async execute({
    blogId,
    title,
    shortDescription,
    content,
  }: CreatePostToBlogCommand): Promise<InterlayerResult<Nullable<PostOutputModel>>> {
    const blog = await this.blogsSqlQueryRepository.getBlogById(blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
    const newPost = new Post({ blogId, title, shortDescription, content })
    const createdPost = await this.postsSqlRepository.create(newPost)

    return InterlayerResult.Ok(createdPost)
  }
}
