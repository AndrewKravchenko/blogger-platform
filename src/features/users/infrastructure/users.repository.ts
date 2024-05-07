import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from '../domain/user.entity'
// import { ObjectId } from 'mongodb'
// import {
//   FullUserOutputMapper,
//   FullUserOutputModel,
//   UserOutputMapper,
//   UserOutputModel,
// } from '../api/models/output/user.output.model'
// import { PasswordHashResult } from '../application/users.service'

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // async getUserByConfirmationCode(confirmationCode: string): Promise<FullUserOutputModel | null> {
  //   const user = await this.userModel.findOne({ 'emailConfirmation.confirmationCode': confirmationCode })
  //
  //   if (!user) {
  //     return null
  //   }
  //
  //   return FullUserOutputMapper(user)
  // }
  //
  // async getUserByPasswordRecoveryCode(code: string): Promise<FullUserOutputModel | null> {
  //   const user = await this.userModel.findOne({ 'passwordRecovery.code': code })
  //
  //   if (!user) {
  //     return null
  //   }
  //
  //   return FullUserOutputMapper(user)
  // }
  //
  // async create(user: User): Promise<UserOutputModel> {
  //   const createdUser = await this.userModel.create(user)
  //   return UserOutputMapper(createdUser)
  // }
  //
  // async createRecoveryCode(userId: string, passwordRecovery: PasswordRecovery): Promise<boolean> {
  //   const result = await this.userModel.updateOne({ _id: new ObjectId(userId) }, { $set: { passwordRecovery } })
  //   return !!result.matchedCount
  // }
  //
  // async markEmailConfirmed(userId: string): Promise<boolean> {
  //   const result = await this.userModel.updateOne({ _id: new ObjectId(userId) }, { $unset: { emailConfirmation: '' } })
  //   return !!result.matchedCount
  // }
  //
  // async changeEmailConfirmationCode(userId: string, confirmationCode: string): Promise<boolean> {
  //   const result = await this.userModel.updateOne(
  //     { _id: new ObjectId(userId) },
  //     { $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
  //   )
  //
  //   return !!result.matchedCount
  // }
  //
  // async changePassword(userId: string, passwordData: PasswordHashResult): Promise<boolean> {
  //   const result = await this.userModel.updateOne(
  //     { _id: new ObjectId(userId) },
  //     {
  //       $set: { passwordSalt: passwordData.passwordSalt, password: passwordData.passwordHash },
  //       $unset: { passwordRecovery: '' },
  //     },
  //   )
  //
  //   return !!result.matchedCount
  // }
  //
  // async deleteById(userId: string): Promise<boolean> {
  //   const result = await this.userModel.updateOne({ _id: new ObjectId(userId) }, { $set: { isDeleted: true } })
  //   return !!result.matchedCount
  // }
}
