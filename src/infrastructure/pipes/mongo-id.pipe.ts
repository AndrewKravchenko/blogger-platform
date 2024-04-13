import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { ObjectId } from 'mongodb'

@Injectable()
export class MongoIdPipe implements PipeTransform {
  transform(value: any) {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException({ message: 'Incorrect id! ', field: 'id' })
    }
    return value
  }
}
