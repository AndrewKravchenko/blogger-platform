import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Injectable } from '@nestjs/common'
import { BlogsSqlQueryRepository } from '../../../features/blogs/blogs/infrastructure/blogs.sql-query-repository'

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsSqlQueryRepository: BlogsSqlQueryRepository) {}

  async validate(blogId: string): Promise<boolean> {
    const blog = await this.blogsSqlQueryRepository.getBlogById(blogId)
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
