import { Injectable } from '@nestjs/common'
import { BlogsRepository } from '../infrastructure/blogs.repository'
import { CreateBlogInputModel, CreatePostToBlogInputModel } from '../api/models/input/create-blog.input.model'
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository'
import { BlogOutputModel } from '../api/models/output/blog.output.model'
import { QueryPostModel } from '../../posts/api/models/input/query-post.input.model'
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository'
import { PaginatedResponse } from '../../../common/models/common.model'
import { PostOutputModel } from '../../posts/api/models/output/post.output.model'
import { PostsService } from '../../posts/application/posts.service'
import { CreatePostInputModel } from '../../posts/api/models/input/create-post.input.model'
import { UpdateBlogInputModel } from '../api/models/input/update-blog.input.model'
import { InterlayerResult, InterlayerResultCode } from '../../../common/models/result-layer.model'

@Injectable()
export class BlogsService {
  constructor(
    private readonly postsService: PostsService,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async getPostsByBlogId(
    postQuery: QueryPostModel,
    blogId: string,
    userId?: string,
  ): Promise<InterlayerResult<Nullable<PaginatedResponse<PostOutputModel>>>> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const paginatedPosts = await this.postsQueryRepository.getPostsByBlogId(blogId, postQuery)

    for (const post of paginatedPosts.items) {
      await this.postsService.extendPostLikesInfo(post, userId)
    }

    return InterlayerResult.Ok(paginatedPosts)
  }

  async createBlog(body: CreateBlogInputModel): Promise<BlogOutputModel> {
    return await this.blogsRepository.create(body)
  }

  async createPostToBlog(
    blogId: string,
    createPostModel: CreatePostToBlogInputModel,
    userId?: string,
  ): Promise<InterlayerResult<Nullable<PostOutputModel>>> {
    const newPost: CreatePostInputModel = { ...createPostModel, blogId }
    return await this.postsService.createPost(newPost, userId)
  }

  async updateBlog(blogId: string, updatedBlog: UpdateBlogInputModel): Promise<InterlayerResult> {
    const isUpdated = await this.blogsRepository.updateBlog(blogId, updatedBlog)

    if (isUpdated) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }

  async deleteBlogById(blogId: string): Promise<InterlayerResult> {
    const isDeleted = await this.blogsRepository.deleteBlogById(blogId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }
}
