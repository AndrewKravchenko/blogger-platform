import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { CommentOutputModel } from '../../../../comments/api/models/output/comment.output.model'
import { PostsSqlQueryRepository } from '../../../infrastructure/posts.sql-query-repository'
import { CommentsSqlRepository } from '../../../../comments/infrastructure/comments.sql-repository'
import { UsersSqlQueryRepository } from '../../../../../users/infrastructure/users.sql-query-repository'

export class CreateCommentToPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentToPostCommand)
export class CreateCommentToPostHandler
  implements ICommandHandler<CreateCommentToPostCommand, InterlayerResult<Nullable<CommentOutputModel>>>
{
  constructor(
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly usersSqlQueryRepository: UsersSqlQueryRepository,
  ) {}

  async execute({
    postId,
    userId,
    content,
  }: CreateCommentToPostCommand): Promise<InterlayerResult<Nullable<CommentOutputModel>>> {
    const post = await this.postsSqlQueryRepository.getPostById(postId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const user = await this.usersSqlQueryRepository.getUserById(userId)

    if (!user) {
      return InterlayerResult.Error(InterlayerResultCode.Unauthorized)
    }
    const comment = await this.commentsSqlRepository.createCommentToPost(postId, userId, content)

    return InterlayerResult.Ok(comment)
  }
}
