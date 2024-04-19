import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { BlogsQueryRepository } from '../../../features/blogs/infrastructure/blogs.query-repository'
import { Injectable } from '@nestjs/common'

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
