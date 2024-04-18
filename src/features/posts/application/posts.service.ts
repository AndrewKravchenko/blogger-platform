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
import { InterlayerResult, InterlayerResultCode } from '../../../common/models/result-layer.model'
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

  async getPostById(postId: string, userId?: string): Promise<InterlayerResult<PostOutputModel | null>> {
    const post = await this.postsQueryRepository.getPostById(postId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    return InterlayerResult.Ok(await this.extendPostLikesInfo(post, userId))
  }

  async createPost(
    postInputModel: CreatePostInputModel,
    userId?: string,
  ): Promise<InterlayerResult<PostOutputModel | null>> {
    const blog = await this.blogsQueryRepository.getBlogById(postInputModel.blogId)

    if (!blog) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const newPost = new Post({ ...postInputModel, blogName: blog.name })
    const createdPost = await this.postsRepository.create(newPost)

    return InterlayerResult.Ok(await this.extendPostLikesInfo(createdPost, userId))
  }

  async createCommentToPost(
    postId: string,
    userId: string,
    content: string,
  ): Promise<InterlayerResult<CommentOutputModel | null>> {
    const post = await this.getPostById(postId)

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

  async updatePost(postId: string, updatedPost: UpdatePostInputModel): Promise<InterlayerResult> {
    const isUpdated = await this.postsRepository.updatePost(postId, updatedPost)

    if (isUpdated) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
  }

  async updateLikeStatus(userId: string, postId: string, newLikeStatus: LikeStatus): Promise<InterlayerResult> {
    const post = await this.getPostById(postId)

    if (!post) {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }

    const myStatus = await this.likesQueryRepository.getPostLikeStatus(postId, userId)

    if (myStatus === newLikeStatus) {
      return InterlayerResult.Ok()
    }

    await this.updateLikesCount(postId, myStatus || LikeStatus.None, newLikeStatus)

    if (myStatus) {
      await this.likesService.updatePostLikeStatus(postId, userId, newLikeStatus)
    } else {
      await this.likesService.createPostLikeStatus(postId, userId, newLikeStatus)
    }

    return InterlayerResult.Ok()
  }

  async deletePostById(postId: string): Promise<InterlayerResult> {
    const isDeleted = await this.postsRepository.deletePostById(postId)

    if (isDeleted) {
      return InterlayerResult.Ok()
    } else {
      return InterlayerResult.Error(InterlayerResultCode.NotFound)
    }
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
