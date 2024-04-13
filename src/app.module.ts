import { MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { appSettings } from './settings/app-settings'
import { UsersRepository } from './features/users/infrastructure/users.repository'
import { UsersService } from './features/users/application/users.service'
import { UsersQueryRepository } from './features/users/infrastructure/users.query-repository'
import { User, UserSchema } from './features/users/domain/user.entity'
import { UsersController } from './features/users/api/users.controller'
import { LoggerMiddleware } from './infrastructure/middlewares/logger.middleware'
import { ConfigModule } from '@nestjs/config'
import { BlogsController } from './features/blogs/api/blogs.controller'
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository'
import { BlogsService } from './features/blogs/application/blogs.service'
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
import { CommentsService } from './features/comments/application/comments.service'
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
import { RateLimiterMiddleware } from './infrastructure/middlewares/rate-limiter-middleware'
import { RequestLog, RequestLogSchema } from './features/requests/domain/request-log.entity'
import { RequestLogsRepository } from './features/requests/infrastructure/request-logs.repository'
import { JwtStrategy } from './features/auth/strategies/jwt.strategy'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'
import { MailerModule } from '@nestjs-modules/mailer'
import { EmailsService } from './features/emails/application/emails.service'
import { JwtCookieStrategy } from './features/auth/strategies/jwt-cookie.strategy'
import { CommentsRepository } from './features/comments/infrastructure/comments.repository'
import { LikesRepository } from './features/likes/infrastructure/likes.repository'
import { DecodeUserIdMiddleware } from './infrastructure/middlewares/user-id .middleware'

const usersProviders: Provider[] = [UsersRepository, UsersService, UsersQueryRepository]
const authProviders: Provider[] = [AuthService, LocalStrategy, JwtStrategy, JwtCookieStrategy, JwtService]
const postsProviders: Provider[] = [PostsRepository, PostsQueryRepository, PostsService]
const blogsProviders: Provider[] = [BlogsQueryRepository, BlogsRepository, BlogsService]
const likesProviders: Provider[] = [LikesQueryRepository, LikesRepository, LikesService]
const sessionsProviders: Provider[] = [SessionsRepository, SessionsQueryRepository, SessionsService]
const commentsProviders: Provider[] = [CommentsQueryRepository, CommentsRepository, CommentsService]
const requestLogsProviders: Provider[] = [RequestLogsRepository]
const emailsProviders: Provider[] = [EmailsService]
const testingProviders: Provider[] = [TestingService]

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './env/.dev.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(appSettings.api.MONGO_URI),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Session.name, schema: SessionSchema },
      { name: RequestLog.name, schema: RequestLogSchema },
    ]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Andrew" <${process.env.EMAIL_USER}>`,
      },
      template: {
        dir: process.cwd() + '/src/features/emails/templates',
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
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
    ...emailsProviders,
    ...testingProviders,
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
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(DecodeUserIdMiddleware)
      .forRoutes('*')
      .apply(RateLimiterMiddleware)
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST })
  }
}
