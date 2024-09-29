import { Module, Provider } from '@nestjs/common'
import { CommentsController } from './comments/api/comments.controller'
import { PostsController } from './posts/api/posts.controller'
import { BlogsController } from './blogs/api/blogs.controller'
import { PostsService } from './posts/application/posts.service'
import { Blog } from './blogs/domain/blog.sql-entity'
import { Post } from './posts/domain/post.sql-entity'
import { Comment } from './comments/domain/comment.sql-entity'
import { LikesSqlQueryRepository } from './likes/infrastructure/likes.sql-query-repository'
import { LikesSqlRepository } from './likes/infrastructure/likes-sql-repository.service'
import { LikesService } from './likes/application/likes.service'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
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
import { UpdatePostLikeStatusHandler } from './posts/application/use-cases/commands/update-post-like-status.handler'
import { BlogIsExistConstraint } from '../../infrastructure/decorators/validate/blog-is-exist'
import { BlogsSqlQueryRepository } from './blogs/infrastructure/blogs.sql-query-repository'
import { BlogsSqlRepository } from './blogs/infrastructure/blogs.sql-repository'
import { PostsSqlRepository } from './posts/infrastructure/posts.sql-repository'
import { PostsSqlQueryRepository } from './posts/infrastructure/posts.sql-query-repository'
import { SuperAdminBlogsController } from './blogs/api/super-admin-blogs.controller'
import { DeletePostHandler } from './blogs/application/use-cases/commands/delete-post.handler'
import { UpdatePostHandler } from './blogs/application/use-cases/commands/update-post.handler'
import { CommentsSqlQueryRepository } from './comments/infrastructure/comments.sql-query-repository'
import { CommentsSqlRepository } from './comments/infrastructure/comments.sql-repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Like } from './likes/domain/like.sql-entity'

const blogsProviders: Provider[] = [
  BlogsSqlRepository,
  BlogsSqlQueryRepository,
  GetPostsByBlogIdHandler,
  CreateBlogHandler,
  CreatePostToBlogHandler,
  UpdateBlogHandler,
  UpdatePostHandler,
  DeleteBlogHandler,
  DeletePostHandler,
  BlogIsExistConstraint,
]

const postsProviders: Provider[] = [
  PostsSqlRepository,
  PostsSqlQueryRepository,
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
  CommentsSqlRepository,
  CommentsSqlQueryRepository,
  GetCommentByIdHandler,
  UpdateCommentHandler,
  UpdateCommentLikeStatusHandler,
  DeleteCommentHandler,
]
const likesProviders: Provider[] = [LikesSqlQueryRepository, LikesSqlRepository, LikesService]

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Post, Comment, Like]),
    // MongooseModule.forFeature([
    //   { name: Blog.name, schema: BlogSchema },
    //   { name: Post.name, schema: PostSchema },
    //   { name: Like.name, schema: LikeSchema },
    //   { name: Comment.name, schema: CommentSchema },
    // ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [BlogsController, SuperAdminBlogsController, PostsController, CommentsController],
  providers: [...blogsProviders, ...postsProviders, ...commentsProviders, ...likesProviders],
})
export class BlogsModule {}
