import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { User } from '../../users/domain/user.entity'
import { Post } from '../../posts/domain/post.entity'
import { Blog } from '../../blogs/domain/blog.entity'
import { Like } from '../../likes/domain/like.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Comment } from '../../comments/domain/comment.entity'

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: Model<Blog>,
    @InjectModel(Post.name) private postsModel: Model<Post>,
    @InjectModel(User.name) private usersModel: Model<User>,
    @InjectModel(Comment.name) private commentsModel: Model<Comment>,
    @InjectModel(Like.name) private likesModel: Model<Like>,
  ) {}

  async dropDatabase() {
    await this.blogsModel.deleteMany({})
    await this.postsModel.deleteMany({})
    await this.usersModel.deleteMany({})
    await this.commentsModel.deleteMany({})
    await this.likesModel.deleteMany({})
  }
}
