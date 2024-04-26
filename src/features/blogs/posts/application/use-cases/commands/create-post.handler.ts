import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { Post } from '../../../domain/post.entity'
import { PostsRepository } from '../../../infrastructure/posts.repository'
import { BlogsQueryRepository } from '../../../../blogs/infrastructure/blogs.query-repository'
import { PostsService } from '../../posts.service'
import { PostOutputModel } from '../../../api/models/output/post.output.model'

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
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<InterlayerResult<Nullable<PostOutputModel>>> {
    const { userId, ...postInputModel } = command
    const blog = await this.blogsQueryRepository.getBlogById(command.blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const newPost = new Post({ ...postInputModel, blogName: blog.name })
    const createdPost = await this.postsRepository.create(newPost)

    return InterlayerResult.Ok(await this.postsService.extendPostLikesInfo(createdPost, userId))
  }
}
