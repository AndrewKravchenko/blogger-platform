import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { PostOutputModel } from '../../../../posts/api/models/output/post.output.model'
import { Post } from '../../../../posts/domain/post.entity'
import { BlogsQueryRepository } from '../../../infrastructure/blogs.query-repository'
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository'
import { PostsService } from '../../../../posts/application/posts.service'

export class CreatePostToBlogCommand {
  public blogId: string
  public title: string
  public shortDescription: string
  public content: string
  public userId?: string

  constructor({ blogId, title, shortDescription, content, userId }: CreatePostToBlogCommand) {
    this.blogId = blogId
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
    this.userId = userId
  }
}

@CommandHandler(CreatePostToBlogCommand)
export class CreatePostToBlogHandler
  implements ICommandHandler<CreatePostToBlogCommand, InterlayerResult<Nullable<PostOutputModel>>>
{
  constructor(
    private readonly postsService: PostsService,
    private readonly postsRepository: PostsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute({
    blogId,
    title,
    shortDescription,
    content,
    userId,
  }: CreatePostToBlogCommand): Promise<InterlayerResult<Nullable<PostOutputModel>>> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const newPost = new Post({ blogId, title, shortDescription, content, blogName: blog.name })
    const createdPost = await this.postsRepository.create(newPost)
    const postWithExtendedLikesInfo = await this.postsService.extendPostLikesInfo(createdPost, userId)

    return InterlayerResult.Ok(postWithExtendedLikesInfo)
  }
}
