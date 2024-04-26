import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InterlayerResult, InterlayerResultCode } from '../../../../../../common/models/result-layer.model'
import { PaginatedResponse } from '../../../../../../common/models/common.model'
import { PostOutputModel } from '../../../../posts/api/models/output/post.output.model'
import { BlogsQueryRepository } from '../../../infrastructure/blogs.query-repository'
import { PostsService } from '../../../../posts/application/posts.service'
import { PostsQueryRepository } from '../../../../posts/infrastructure/posts.query-repository'

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
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    queryPayload: GetPostsByBlogIdQueryPayload,
  ): Promise<InterlayerResult<Nullable<PaginatedResponse<PostOutputModel>>>> {
    const { blogId, userId, ...postQuery } = queryPayload
    const blog = await this.blogsQueryRepository.getBlogById(blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const paginatedPosts = await this.postsQueryRepository.getPostsByBlogId(blogId, postQuery)
    await Promise.all(paginatedPosts.items.map((post) => this.postsService.extendPostLikesInfo(post, userId)))

    return InterlayerResult.Ok(paginatedPosts)
  }
}
