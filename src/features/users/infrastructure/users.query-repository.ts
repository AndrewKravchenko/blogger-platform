import { Injectable } from '@nestjs/common'
import { User } from '../domain/user.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import {
  // FullUserOutputMapper,
  // FullUserOutputModel,
  MeOutputMapper,
  MeOutputModel,
  UserOutputMapper,
  UserOutputModel,
} from '../api/models/output/user.output.model'
// import { QueryUserModel } from '../api/models/input/query-user.input.model'
// import { paginationSkip } from '../../../infrastructure/utils/queryParams'
// import { PaginatedResponse } from '../../../common/models/common.model'

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getMe(userId: string): Promise<Nullable<MeOutputModel>> {
    const user = await this.userModel.findById(userId)

    if (!user) {
      return null
    }

    return MeOutputMapper(user)
  }

  // async getUserByLoginOrEmail(loginOrEmail: string, email?: string): Promise<Nullable<FullUserOutputModel>> {
  //   const user = await this.userModel.findOne({
  //     $or: [
  //       { login: { $regex: loginOrEmail, $options: 'i' } },
  //       { email: { $regex: email || loginOrEmail, $options: 'i' } },
  //     ],
  //   })
  //
  //   if (!user) {
  //     return null
  //   }
  //
  //   return FullUserOutputMapper(user)
  // }

  // async getUsers({
  //   sortBy,
  //   sortDirection,
  //   pageNumber,
  //   pageSize,
  //   searchLoginTerm,
  //   searchEmailTerm,
  // }: QueryUserModel): Promise<PaginatedResponse<UserOutputModel>> {
  //   const filter: FilterQuery<User> = { isDeleted: false }
  //
  //   if (searchLoginTerm) {
  //     filter.$or = [{ login: { $regex: searchLoginTerm, $options: 'i' } }]
  //   }
  //
  //   if (searchEmailTerm) {
  //     filter.$or = filter.$or || []
  //     filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } })
  //   }
  //
  //   const users = await this.userModel
  //     .find(filter)
  //     .sort({ [sortBy]: sortDirection })
  //     .skip(paginationSkip(pageNumber, pageSize))
  //     .limit(pageSize)
  //
  //   const totalCount = await this.userModel.countDocuments(filter)
  //   const pagesCount = Math.ceil(totalCount / pageSize)
  //
  //   return {
  //     pagesCount,
  //     page: pageNumber,
  //     pageSize,
  //     totalCount,
  //     items: users.map(UserOutputMapper),
  //   }
  // }

  // public async getUserById(userId: string): Promise<Nullable<UserOutputModel>> {
  //   const user = await this.userModel.findById(userId)
  //
  //   if (!user) {
  //     return null
  //   }
  //
  //   return UserOutputMapper(user)
  // }
}
