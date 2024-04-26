import { Module, Provider } from '@nestjs/common'
import { CommentsController } from './comments/api/comments.controller'
import { PostsController } from './posts/api/posts.controller'
import { BlogsController } from './blogs/api/blogs.controller'
import { PostsService } from './posts/application/posts.service'
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository'
import { BlogsRepository } from './blogs/infrastructure/blogs.repository'
import { MongooseModule } from '@nestjs/mongoose'
import { Blog, BlogSchema } from './blogs/domain/blog.entity'
import { Post, PostSchema } from './posts/domain/post.entity'
import { Comment, CommentSchema } from './comments/domain/comment.entity'
import { Like, LikeSchema } from './likes/domain/like.entity'
import { LikesQueryRepository } from './likes/infrastructure/likes.query-repository'
import { LikesRepository } from './likes/infrastructure/likes.repository'
import { LikesService } from './likes/application/likes.service'
import { PostsRepository } from './posts/infrastructure/posts.repository'
import { PostsQueryRepository } from './posts/infrastructure/posts.query-repository'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository'
import { CommentsRepository } from './comments/infrastructure/comments.repository'
import { GetPostsByBlogIdHandler } from './blogs/application/use-cases/queries/get-posts-by-blog-id.handler'
import { CreateBlogHandler } from './blogs/application/use-cases/commands/create-blog.handler'
import { CreatePostToBlogHandler } from './blogs/application/use-cases/commands/create-post-to-blog.handler'
import { UpdateBlogHandler } from './blogs/application/use-cases/commands/update-blog.handler'
import { DeleteBlogHandler } from './blogs/application/use-cases/commands/delete-blog.handler'
import { GetCommentByIdHandler } from './comments/application/use-cases/queries/get-comment-by-id.handler'
import { UpdateCommentHandler } from './comments/application/use-cases/commands/update-comment.handler'
import { UpdateCommentLikeStatusHandler } from './comments/application/use-cases/commands/update-comment-like-status.handler'
import { DeleteCommentHandler } from './comments/application/use-cases/commands/delete-comment.handler'
import { GetPostsHandler } from './posts/application/use-cases/queries/get-posts.handler'
import { GetPostByIdHandler } from './posts/application/use-cases/queries/get-post-by-id.handler'
import { GetPostCommentsHandler } from './posts/application/use-cases/queries/get-post-comments.handler'
import { CreatePostHandler } from './posts/application/use-cases/commands/create-post.handler'
import { CreateCommentToPostHandler } from './posts/application/use-cases/commands/create-comment-to-post.handler'
import { UpdatePostHandler } from './posts/application/use-cases/commands/update-post.handler'
import { UpdatePostLikeStatusHandler } from './posts/application/use-cases/commands/update-post-like-status.handler'
import { DeletePostHandler } from './posts/application/use-cases/commands/delete-post.handler'
import { BlogIsExistConstraint } from '../../infrastructure/decorators/validate/blog-is-exist'

const blogsProviders: Provider[] = [
  BlogsQueryRepository,
  BlogsRepository,
  GetPostsByBlogIdHandler,
  CreateBlogHandler,
  CreatePostToBlogHandler,
  UpdateBlogHandler,
  DeleteBlogHandler,
  BlogIsExistConstraint,
]

const postsProviders: Provider[] = [
  PostsRepository,
  PostsQueryRepository,
  PostsService,
  GetPostsHandler,
  GetPostByIdHandler,
  GetPostCommentsHandler,
  CreatePostHandler,
  CreateCommentToPostHandler,
  UpdatePostHandler,
  UpdatePostLikeStatusHandler,
  DeletePostHandler,
]

const commentsProviders: Provider[] = [
  CommentsQueryRepository,
  CommentsRepository,
  GetCommentByIdHandler,
  UpdateCommentHandler,
  UpdateCommentLikeStatusHandler,
  DeleteCommentHandler,
]
const likesProviders: Provider[] = [LikesQueryRepository, LikesRepository, LikesService]

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [...blogsProviders, ...postsProviders, ...commentsProviders, ...likesProviders],
})
export class BlogsModule {}
