import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { Comment } from '../../../../comments/domain/comment.entity'
import { CommentOutputModel } from '../../../../comments/api/models/output/comment.output.model'
import { LikeStatus } from '../../../../likes/domain/like.entity'
import { UsersQueryRepository } from '../../../../../users/infrastructure/users.query-repository'
import { CommentsRepository } from '../../../../comments/infrastructure/comments.repository'
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository'

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
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({
    postId,
    userId,
    content,
  }: CreateCommentToPostCommand): Promise<InterlayerResult<Nullable<CommentOutputModel>>> {
    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const user = await this.usersQueryRepository.getUserById(userId)

    if (!user) {
      return InterlayerResult.Error(InterlayerResultCode.Unauthorized)
    }

    const newComment = new Comment({
      postId,
      content,
      likesInfo: { likesCount: 0, dislikesCount: 0 },
      commentatorInfo: { userId, userLogin: user.login },
    })

    const comment = await this.commentsRepository.createCommentToPost(newComment)

    return InterlayerResult.Ok(CommentOutputModel.addUserStatus(comment, LikeStatus.None))
  }
}
