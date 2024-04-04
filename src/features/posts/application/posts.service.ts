import { Injectable } from '@nestjs/common'
import { PostsRepository } from '../infrastructure/posts.repository'
import { CreatePostInputModel } from '../api/models/input/create-post.input.model'
import { PostsQueryRepository } from '../infrastructure/posts.query-repository'
import { PostOutputModel } from '../api/models/output/post.output.model'
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository'
import { Post } from '../domain/post.entity'
import { LikesQueryRepository } from '../../likes/infrastructure/likes.query-repository'
import { LikeStatus } from '../../likes/domain/like.entity'
import { LikesService } from '../../likes/application/likes.service'
import { ExtendedLikesInfoOutputModel } from '../../likes/models/output/like.output.model'
import { QueryPostModel } from '../api/models/input/query-post.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { UpdatePostInputModel } from '../api/models/input/update-post.input.model'

@Injectable()
export class PostsService {
  constructor(
    private readonly likesService: LikesService,
    private readonly postsRepository: PostsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async getPosts(postQuery: QueryPostModel, userId?: string): Promise<PaginatedResponse<PostOutputModel>> {
    const paginatedPosts = await this.postsQueryRepository.getPosts(postQuery)

    for (const post of paginatedPosts.items) {
      await this.setPostExtendedLikesInfo(post, userId)
    }

    return paginatedPosts
  }

  async getPostById(postId: string, userId?: string): Promise<PostOutputModel | null> {
    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      return null
    }

    await this.setPostExtendedLikesInfo(post, userId)

    return post
  }

  async createPost(postInputModel: CreatePostInputModel, userId?: string): Promise<PostOutputModel | null> {
    const blog = await this.blogsQueryRepository.getBlogById(postInputModel.blogId)

    if (!blog) {
      return null
    }

    const newPost = new Post({ ...postInputModel, blogName: blog.name })
    const createdPost = await this.postsRepository.create(newPost)

    await this.setPostExtendedLikesInfo(createdPost, userId)

    return createdPost
  }

  async updatePost(postId: string, updatedPost: UpdatePostInputModel): Promise<boolean> {
    return await this.postsRepository.updatePost(postId, updatedPost)
  }

  async deletePostById(postId: string): Promise<boolean> {
    return await this.postsRepository.deletePostById(postId)
  }

  async setPostExtendedLikesInfo(post: PostOutputModel, userId?: string): Promise<void> {
    const userLikeStatus = (await this.likesQueryRepository.getUserPostLikeStatus(post.id, userId)) || LikeStatus.None
    const newestLikes = await this.likesService.getPostNewestLikes(post.id)

    post.extendedLikesInfo = new ExtendedLikesInfoOutputModel(
      post.extendedLikesInfo.likesCount,
      post.extendedLikesInfo.dislikesCount,
      userLikeStatus,
      newestLikes,
    )
  }
}
