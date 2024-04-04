import { Injectable } from '@nestjs/common'
import { LikesQueryRepository } from '../infrastructure/likes.query-repository'
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository'
import { NewestLikeOutputModel } from '../models/output/like.output.model'

@Injectable()
export class LikesService {
  constructor(
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async getPostNewestLikes(postId: string): Promise<NewestLikeOutputModel[] | null> {
    const newestLikes = await this.likesQueryRepository.getPostNewestLikes(postId)

    if (!newestLikes) {
      return null
    }

    return Promise.all(
      newestLikes.map(async ({ userId, createdAt }) => {
        const user = await this.usersQueryRepository.getUserById(userId)

        return new NewestLikeOutputModel(user?.login, userId, createdAt)
      }),
    )
  }
}
