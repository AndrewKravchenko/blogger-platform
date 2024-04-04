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
  ): Promise<PaginatedResponse<PostOutputModel> | null> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId)

    if (!blog) {
      return null
    }

    const paginatedPosts = await this.postsQueryRepository.getPostsByBlogId(blogId, postQuery)

    for (const post of paginatedPosts.items) {
      await this.postsService.setPostExtendedLikesInfo(post, userId)
    }

    return paginatedPosts
  }

  async createBlog(blog: CreateBlogInputModel): Promise<BlogOutputModel> {
    return await this.blogsRepository.create(blog)
  }

  async createPostToBlog(
    blogId: string,
    createPostModel: CreatePostToBlogInputModel,
    userId?: string,
  ): Promise<PostOutputModel | null> {
    const newPost: CreatePostInputModel = { ...createPostModel, blogId }
    return await this.postsService.createPost(newPost, userId)
  }

  async updateBlog(blogId: string, updatedBlog: UpdateBlogInputModel): Promise<boolean> {
    return await this.blogsRepository.updateBlog(blogId, updatedBlog)
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    return await this.blogsRepository.deleteBlogById(blogId)
  }
}
