import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { User } from '../../users/domain/user.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Blog } from '../../blogs/blogs/domain/blog.entity'
import { Comment } from '../../blogs/comments/domain/comment.entity'
import { Post } from '../../blogs/posts/domain/post.entity'
import { Like } from '../../blogs/likes/domain/like.entity'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: Model<Blog>,
    @InjectModel(Post.name) private postsModel: Model<Post>,
    @InjectModel(User.name) private usersModel: Model<User>,
    @InjectModel(Comment.name) private commentsModel: Model<Comment>,
    @InjectModel(Like.name) private likesModel: Model<Like>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async dropDatabase() {
    await this.blogsModel.deleteMany({})
    await this.postsModel.deleteMany({})
    await this.usersModel.deleteMany({})
    await this.commentsModel.deleteMany({})
    await this.likesModel.deleteMany({})
    await this.dataSource.query('DELETE FROM "Session"')
    await this.dataSource.query('DELETE FROM "User" CASCADE')
  }
}
