import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { PaginatedResponse } from '../../../../../../common/models/common.model'
import { PostOutputModel } from '../../../../posts/api/models/output/post.output.model'
import { PostsService } from '../../../../posts/application/posts.service'
import { PostsSqlQueryRepository } from '../../../../posts/infrastructure/posts.sql-query-repository'
import { BlogsSqlQueryRepository } from '../../../infrastructure/blogs.sql-query-repository'

export class GetPostsByBlogIdQueryPayload {
  public blogId: string
  public userId?: string
  public sortBy: 'id' | 'blogName' | 'title' | 'createdAt' = 'createdAt'
  public sortDirection: 'asc' | 'desc'
  public pageNumber: number
  public pageSize: number

  constructor({ blogId, userId, sortBy, sortDirection, pageNumber, pageSize }: GetPostsByBlogIdQueryPayload) {
    this.blogId = blogId
    this.userId = userId
    this.sortBy = sortBy
    this.sortDirection = sortDirection
    this.pageNumber = pageNumber
    this.pageSize = pageSize
  }
}

@QueryHandler(GetPostsByBlogIdQueryPayload)
export class GetPostsByBlogIdHandler implements IQueryHandler<GetPostsByBlogIdQueryPayload> {
  constructor(
    private readonly postsService: PostsService,
    private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}

  async execute(
    queryPayload: GetPostsByBlogIdQueryPayload,
  ): Promise<InterlayerResult<Nullable<PaginatedResponse<PostOutputModel>>>> {
    const { blogId, userId, ...postQuery } = queryPayload
    const blog = await this.blogsSqlQueryRepository.getBlogById(blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const paginatedPosts = await this.postsSqlQueryRepository.getPostsByBlogId(blogId, postQuery, userId)
    // await Promise.all(paginatedPosts.items.map((post) => this.postsService.extendPostLikesInfo(post, userId)))

    return InterlayerResult.Ok(paginatedPosts)
  }
}
