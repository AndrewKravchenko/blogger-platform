import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PostOutputModel } from '../../../api/models/output/post.output.model'
import { PostsService } from '../../posts.service'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { PostsSqlQueryRepository } from '../../../infrastructure/posts.sql-query-repository'

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
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}

  async execute({ postId, userId }: GetPostByIdQueryPayload): Promise<InterlayerResult<Nullable<PostOutputModel>>> {
    const post = await this.postsSqlQueryRepository.getPostById(postId, userId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    // return InterlayerResult.Ok(await this.postsService.extendPostLikesInfo(post, userId))
    return InterlayerResult.Ok(post)
  }
}
