import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from '../domain/user.entity'
import { ObjectId } from 'mongodb'
import { UserOutputMapper, UserOutputModel } from '../api/models/output/user.output.model'

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public async create(user: User): Promise<UserOutputModel> {
    const createdUser = await this.userModel.create(user)
    return UserOutputMapper(createdUser)
  }

  public async deleteById(userId: string): Promise<boolean> {
    const result = await this.userModel.updateOne({ _id: new ObjectId(userId) }, { $set: { isDeleted: true } })
    return !!result.matchedCount
  }
}
