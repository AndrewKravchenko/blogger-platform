import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PostOutputModel } from '../../../api/models/output/post.output.model'
import { PostsService } from '../../posts.service'
import { PostsQueryRepository } from '../../../infrastructure/posts.query-repository'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'

export class GetPostByIdQueryPayload {
  constructor(
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostByIdQueryPayload)
export class GetPostByIdHandler implements IQueryHandler<GetPostByIdQueryPayload> {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({ postId, userId }: GetPostByIdQueryPayload): Promise<InterlayerResult<Nullable<PostOutputModel>>> {
    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    return InterlayerResult.Ok(await this.postsService.extendPostLikesInfo(post, userId))
  }
}
