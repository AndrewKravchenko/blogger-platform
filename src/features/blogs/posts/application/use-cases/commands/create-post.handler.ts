import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { Post } from '../../../domain/post.entity'
import { PostsService } from '../../posts.service'
import { PostOutputModel } from '../../../api/models/output/post.output.model'
import { BlogsSqlQueryRepository } from '../../../../blogs/infrastructure/blogs.sql-query-repository'
import { PostsSqlRepository } from '../../../infrastructure/posts.sql-repository'

export class CreatePostCommand {
  public title: string
  public shortDescription: string
  public content: string
  public blogId: string
  public userId?: string

  constructor({ title, shortDescription, content, blogId, userId }: CreatePostCommand) {
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
    this.blogId = blogId
    this.userId = userId
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, InterlayerResult<Nullable<PostOutputModel>>>
{
  constructor(
    private readonly postsService: PostsService,
    private readonly postsSqlRepository: PostsSqlRepository,
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<InterlayerResult<Nullable<PostOutputModel>>> {
    const { userId, ...postInputModel } = command
    const blog = await this.blogsSqlQueryRepository.getBlogById(command.blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const newPost = new Post({ ...postInputModel, blogName: blog.name })
    const createdPost = await this.postsSqlRepository.create(newPost)

    return InterlayerResult.Ok(await this.postsService.extendPostLikesInfo(createdPost, userId))
  }
}
