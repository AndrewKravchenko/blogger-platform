import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { isEmail } from 'class-validator'

@Injectable()
export class EmailPipe implements PipeTransform {
  transform(value: any): string {
    if (!isEmail(value)) {
      throw new BadRequestException({ message: 'Incorrect email! ', field: 'email' })
    }
    return value
  }
}
