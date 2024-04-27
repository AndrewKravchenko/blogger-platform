import { Module } from '@nestjs/common'
import { TestingService } from './application/testing.service'
import { TestingController } from './api/testing.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../users/domain/user.entity'
import { Blog, BlogSchema } from '../blogs/blogs/domain/blog.entity'
import { Post, PostSchema } from '../blogs/posts/domain/post.entity'
import { Like, LikeSchema } from '../blogs/likes/domain/like.entity'
import { Comment, CommentSchema } from '../blogs/comments/domain/comment.entity'
import { Session, SessionSchema } from '../sessions/domain/session.entity'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
