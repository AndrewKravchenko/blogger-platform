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
import { QueryPostModel } from '../api/models/input/query-post.input.model'
import { PaginatedResponse } from '../../../common/models/common.model'
import { UpdatePostInputModel } from '../api/models/input/update-post.input.model'
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository'
import { Result, ResultCode } from '../../../common/models/result-layer.model'
import { Comment } from '../../comments/domain/comment.entity'
import { CommentsRepository } from '../../comments/infrastructure/comments.repository'
import { CommentOutputModel } from '../../comments/api/models/output/comment.output.model'

@Injectable()
export class PostsService {
  constructor(
    private readonly likesService: LikesService,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async getPosts(postQuery: QueryPostModel, userId?: string): Promise<PaginatedResponse<PostOutputModel>> {
    const paginatedPosts = await this.postsQueryRepository.getPosts(postQuery)

    for (const post of paginatedPosts.items) {
      await this.extendPostLikesInfo(post, userId)
    }

    return paginatedPosts
  }

  async getPostById(postId: string, userId?: string): Promise<Result<PostOutputModel>> {
    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      return { resultCode: ResultCode.NotFound }
    }

    return { resultCode: ResultCode.Success, data: await this.extendPostLikesInfo(post, userId) }
  }

  async createPost(postInputModel: CreatePostInputModel, userId?: string): Promise<Result<PostOutputModel>> {
    const blog = await this.blogsQueryRepository.getBlogById(postInputModel.blogId)

    if (!blog) {
      return { resultCode: ResultCode.NotFound }
    }

    const newPost = new Post({ ...postInputModel, blogName: blog.name })
    const createdPost = await this.postsRepository.create(newPost)

    return { resultCode: ResultCode.Success, data: await this.extendPostLikesInfo(createdPost, userId) }
  }

  async createCommentToPost(postId: string, userId: string, content: string): Promise<Result<CommentOutputModel>> {
    const post = await this.getPostById(postId)

    if (!post) {
      return { resultCode: ResultCode.NotFound }
    }

    const user = await this.usersQueryRepository.getUserById(userId)

    if (!user) {
      return { resultCode: ResultCode.Unauthorized }
    }

    const newComment = new Comment({
      postId,
      content,
      likesInfo: { likesCount: 0, dislikesCount: 0 },
      commentatorInfo: { userId, userLogin: user.login },
    })

    const comment = await this.commentsRepository.createCommentToPost(newComment)

    return { resultCode: ResultCode.Success, data: CommentOutputModel.addUserStatus(comment, LikeStatus.None) }
  }

  async updatePost(postId: string, updatedPost: UpdatePostInputModel): Promise<Result> {
    const isUpdated = await this.postsRepository.updatePost(postId, updatedPost)
    return { resultCode: isUpdated ? ResultCode.Success : ResultCode.NotFound }
  }

  async updateLikeStatus(userId: string, postId: string, newLikeStatus: LikeStatus): Promise<Result> {
    const post = await this.getPostById(postId)

    if (!post) {
      return { resultCode: ResultCode.NotFound }
    }

    const myStatus = await this.likesQueryRepository.getPostLikeStatus(postId, userId)

    if (myStatus === newLikeStatus) {
      return { resultCode: ResultCode.Success }
    }

    await this.updateLikesCount(postId, myStatus || LikeStatus.None, newLikeStatus)

    if (myStatus) {
      await this.likesService.updatePostLikeStatus(postId, userId, newLikeStatus)
    } else {
      await this.likesService.createPostLikeStatus(postId, userId, newLikeStatus)
    }

    return { resultCode: ResultCode.Success }
  }

  async deletePostById(postId: string): Promise<Result> {
    const isDeleted = await this.postsRepository.deletePostById(postId)
    return { resultCode: isDeleted ? ResultCode.Success : ResultCode.NotFound }
  }

  async updateLikesCount(postId: string, currentLikeStatus: LikeStatus, newLikeStatus: LikeStatus): Promise<boolean> {
    const likesCountUpdate = this.likesService.calculateLikesCountChanges(currentLikeStatus, newLikeStatus)
    return await this.postsRepository.updateLikesCount(postId, likesCountUpdate)
  }

  async extendPostLikesInfo(post: PostOutputModel, userId?: string): Promise<PostOutputModel> {
    const userLikeStatus = (await this.likesQueryRepository.getUserPostLikeStatus(post.id, userId)) || LikeStatus.None
    const newestLikes = await this.likesService.getPostNewestLikes(post.id)

    return PostOutputModel.extendLikesInfo(post, userLikeStatus, newestLikes)
  }
}
