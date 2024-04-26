import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Injectable } from '@nestjs/common'
import { BlogsQueryRepository } from '../../../features/blogs/blogs/infrastructure/blogs.query-repository'

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async validate(blogId: string): Promise<boolean> {
    const blog = await this.blogsQueryRepository.getBlogById(blogId)
    return !!blog
  }

  defaultMessage(): string {
    return 'Blog not found!'
  }
}

export function BlogIsExist(property?: string, validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: BlogIsExistConstraint,
    })
  }
}
