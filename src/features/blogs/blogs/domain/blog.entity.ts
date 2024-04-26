import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { CreateBlogModel } from '../api/models/input/create-blog.input.model'
import { getCurrentDateISOString } from '../../../../infrastructure/utils/common'

export type BlogDocument = HydratedDocument<Blog>

@Schema()
export class Blog {
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true })
  websiteUrl: string

  @Prop({ required: true, default: false })
  isMembership: boolean

  @Prop({ required: true, default: getCurrentDateISOString })
  createdAt: string

  constructor(blogData: CreateBlogModel) {
    this.name = blogData.name
    this.description = blogData.description
    this.websiteUrl = blogData.websiteUrl
    this.isMembership = blogData.isMembership
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog)
