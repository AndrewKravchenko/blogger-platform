import { MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersRepository } from './features/users/infrastructure/users.repository'
import { UsersService } from './features/users/application/users.service'
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository'
import { User, UserSchema } from './features/users/domain/user.entity'
import { UsersController } from './features/users/api/users.controller'
import { LoggerMiddleware } from './infrastructure/middlewares/logger.middleware'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BlogsController } from './features/blogs/api/blogs.controller'
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository'
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository'
import { Blog, BlogSchema } from './features/blogs/domain/blog.entity'
import { PostsController } from './features/posts/api/posts.controller'
import { Post, PostSchema } from './features/posts/domain/post.entity'
import { LikesQueryRepository } from './features/likes/infrastructure/likes.query-repository'
import { LikesService } from './features/likes/application/likes.service'
import { PostsService } from './features/posts/application/posts.service'
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository'
import { Like, LikeSchema } from './features/likes/domain/like.entity'
import { PostsRepository } from './features/posts/infrastructure/posts.repository'
import { AuthService } from './features/auth/application/auth.service'
import { Comment, CommentSchema } from './features/comments/domain/comment.entity'
import { CommentsController } from './features/comments/api/comments.controller'
import { CommentsQueryRepository } from './features/comments/infrastructure/comments.query-repository'
import { TestingService } from './features/testing/application/testing.service'
import { TestingController } from './features/testing/testing.controller'
import { AuthController } from './features/auth/api/auth.controller'
import { LocalStrategy } from './features/auth/strategies/local.strategy'
import { JwtService } from '@nestjs/jwt'
import { SessionsRepository } from './features/sessions/infrastructure/sessions.repository'
import { SessionsQueryRepository } from './features/sessions/infrastructure/sessions.query-repository'
import { SessionsService } from './features/sessions/application/sessions.service'
import { SessionsController } from './features/sessions/api/sessions.controller'
import { Session, SessionSchema } from './features/sessions/domain/session.entity'
import { RequestLog, RequestLogSchema } from './features/requests/domain/request-log.entity'
import { RequestLogsRepository } from './features/requests/infrastructure/request-logs.repository'
import { JwtStrategy } from './features/auth/strategies/jwt.strategy'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { MailerModule } from '@nestjs-modules/mailer'
import { JwtCookieStrategy } from './features/auth/strategies/jwt-cookie.strategy'
import { CommentsRepository } from './features/comments/infrastructure/comments.repository'
import { LikesRepository } from './features/likes/infrastructure/likes.repository'
import { DecodeUserIdMiddleware } from './infrastructure/middlewares/user-id .middleware'
import { CqrsModule } from '@nestjs/cqrs'
import { GetPostsByBlogIdHandler } from './features/blogs/application/use-cases/queries/get-posts-by-blog-id.handler'
import { DeleteBlogHandler } from './features/blogs/application/use-cases/commands/delete-blog.handler'
import { CreateBlogHandler } from './features/blogs/application/use-cases/commands/create-blog.handler'
import { CreatePostToBlogHandler } from './features/blogs/application/use-cases/commands/create-post-to-blog.handler'
import { UpdateBlogHandler } from './features/blogs/application/use-cases/commands/update-blog.handler'
import { GetCommentByIdHandler } from './features/comments/application/use-cases/queries/get-comment-by-id.handler'
import { UpdateCommentHandler } from './features/comments/application/use-cases/commands/update-comment.handler'
import { UpdateCommentLikeStatusHandler } from './features/comments/application/use-cases/commands/update-comment-like-status.handler'
import { DeletePostHandler } from './features/posts/application/use-cases/commands/delete-post.handler'
import { CreatePostHandler } from './features/posts/application/use-cases/commands/create-post.handler'
import { UpdatePostHandler } from './features/posts/application/use-cases/commands/update-post.handler'
import { UpdatePostLikeStatusHandler } from './features/posts/application/use-cases/commands/update-post-like-status.handler'
import { CreateCommentToPostHandler } from './features/posts/application/use-cases/commands/create-comment-to-post.handler'
import { GetPostsHandler } from './features/posts/application/use-cases/queries/get-posts.handler'
import { GetPostByIdHandler } from './features/posts/application/use-cases/queries/get-post-by-id.handler'
import { DeleteCommentHandler } from './features/comments/application/use-cases/commands/delete-comment.handler'
import { GetPostCommentsHandler } from './features/posts/application/use-cases/queries/get-post-comments.handler'
import { BlogIsExistConstraint } from './infrastructure/decorators/validate/blog-is-exist'
import configuration, { Configuration, validate } from './settings/configuration'
import process from 'process'
import { seconds, ThrottlerModule } from '@nestjs/throttler'
import { EmailModule } from './infrastructure/emails/email.module'

const usersProviders: Provider[] = [
  UsersRepository,
  UsersService,
  UsersQueryRepository,
  GetPostsByBlogIdHandler,
  CreateBlogHandler,
  CreatePostToBlogHandler,
  UpdateBlogHandler,
  DeleteBlogHandler,
]
const authProviders: Provider[] = [AuthService, LocalStrategy, JwtStrategy, JwtCookieStrategy, JwtService]
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
const blogsProviders: Provider[] = [BlogsQueryRepository, BlogsRepository]
const likesProviders: Provider[] = [LikesQueryRepository, LikesRepository, LikesService]
const sessionsProviders: Provider[] = [SessionsRepository, SessionsQueryRepository, SessionsService]
const commentsProviders: Provider[] = [
  CommentsQueryRepository,
  CommentsRepository,
  GetCommentByIdHandler,
  UpdateCommentHandler,
  UpdateCommentLikeStatusHandler,
  DeleteCommentHandler,
]
const requestLogsProviders: Provider[] = [RequestLogsRepository]
const testingProviders: Provider[] = [TestingService]

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: seconds(60),
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.development'],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<Configuration, true>) => {
        const environmentSettings = configService.get('environmentSettings', {
          infer: true,
        })
        const databaseSettings = configService.get('databaseSettings', {
          infer: true,
        })

        const uri = environmentSettings.isTesting ? databaseSettings.MONGO_TEST_URI : databaseSettings.MONGO_URI

        return {
          uri,
        }
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Session.name, schema: SessionSchema },
      { name: RequestLog.name, schema: RequestLogSchema },
    ]),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<Configuration, true>) => {
        const { EMAIL_USER, EMAIL_PASSWORD } = configService.get('emailSettings', { infer: true })

        return {
          transport: {
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            ignoreTLS: true,
            secure: true,
            auth: {
              user: EMAIL_USER,
              pass: EMAIL_PASSWORD,
            },
          },
          defaults: {
            from: `"Andrew" <${EMAIL_USER}>`,
          },
          template: {
            dir: process.cwd() + '/src/features/emails/templates',
            adapter: new EjsAdapter(),
            options: {
              strict: true,
            },
          },
        }
      },
      inject: [ConfigService],
    }),
    EmailModule,
  ],
  providers: [
    ...usersProviders,
    ...authProviders,
    ...blogsProviders,
    ...postsProviders,
    ...likesProviders,
    ...commentsProviders,
    ...sessionsProviders,
    ...requestLogsProviders,
    ...testingProviders,
    BlogIsExistConstraint,
  ],
  controllers: [
    AuthController,
    UsersController,
    BlogsController,
    PostsController,
    CommentsController,
    SessionsController,
    TestingController,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*').apply(DecodeUserIdMiddleware).forRoutes('*')
    // .apply(RateLimiterMiddleware)
    // .forRoutes({ path: 'auth/login', method: RequestMethod.POST })
  }
}
