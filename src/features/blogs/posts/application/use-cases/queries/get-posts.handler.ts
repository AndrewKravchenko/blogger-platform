import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PostOutputModel } from '../../../api/models/output/post.output.model'
import { PostsService } from '../../posts.service'
import { PaginatedResponse } from '../../../../../../common/models/common.model'
import { PostsSqlQueryRepository } from '../../../infrastructure/posts.sql-query-repository'

export class GetPostsQueryPayload {
  public userId?: string
  public sortBy: 'id' | 'blogName' | 'title' | 'createdAt'
  public sortDirection: 'asc' | 'desc'
  public pageNumber: number
  public pageSize: number

  constructor({ userId, sortBy, sortDirection, pageNumber, pageSize }: GetPostsQueryPayload) {
    this.userId = userId
    this.sortBy = sortBy
    this.sortDirection = sortDirection
    this.pageNumber = pageNumber
    this.pageSize = pageSize
  }
}

@QueryHandler(GetPostsQueryPayload)
export class GetPostsHandler implements IQueryHandler<GetPostsQueryPayload> {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsSqlQueryRepository: PostsSqlQueryRepository,
  ) {}

  async execute(queryPayload: GetPostsQueryPayload): Promise<PaginatedResponse<PostOutputModel>> {
    const { userId, ...postQuery } = queryPayload

    return await this.postsSqlQueryRepository.getPosts(postQuery, userId)
  }
}
