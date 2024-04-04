import { MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common'
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
import { DecodeUserIdMiddleware } from './infrastructure/middlewares/jwt .middleware'
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

const usersProviders: Provider[] = [UsersRepository, UsersService, UsersQueryRepository]
const authProviders: Provider[] = [AuthService]
const postsProviders: Provider[] = [PostsRepository, PostsQueryRepository, PostsService]
const blogsProviders: Provider[] = [BlogsQueryRepository, BlogsRepository, BlogsService]
const likesProviders: Provider[] = [LikesQueryRepository, LikesService]
const commentsProviders: Provider[] = [CommentsQueryRepository, CommentsService]
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
    ]),
  ],
  providers: [
    ...usersProviders,
    ...authProviders,
    ...blogsProviders,
    ...postsProviders,
    ...likesProviders,
    ...commentsProviders,
    ...testingProviders,
  ],
  controllers: [UsersController, BlogsController, PostsController, CommentsController, TestingController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*').apply(DecodeUserIdMiddleware).forRoutes('*')
  }
}
