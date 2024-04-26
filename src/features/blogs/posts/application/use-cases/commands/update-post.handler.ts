import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PostsRepository } from '../../../infrastructure/posts.repository'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'

export class UpdatePostCommand {
  public title: string
  public shortDescription: string
  public content: string
  public blogId: string
  public postId: string

  constructor({ title, shortDescription, content, blogId, postId }: UpdatePostCommand) {
    this.title = title
    this.shortDescription = shortDescription
    this.content = content
    this.blogId = blogId
    this.postId = postId
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand, InterlayerResult> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<InterlayerResult> {
    const { postId, ...updatedPost } = command
    const isUpdated = await this.postsRepository.updatePost(postId, updatedPost)

    if (isUpdated) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
