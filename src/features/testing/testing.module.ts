import { Module } from '@nestjs/common'
import { TestingService } from './application/testing.service'
import { TestingController } from './api/testing.controller'
import { User } from '../users/domain/user.entity'
import { Blog } from '../blogs/blogs/domain/blog.entity'
import { Post } from '../blogs/posts/domain/post.entity'
import { Like } from '../blogs/likes/domain/like.entity'
import { Comment } from '../blogs/comments/domain/comment.entity'
import { Session } from '../sessions/domain/session.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([User, Blog, Post, Like, Comment, Session])],
  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
