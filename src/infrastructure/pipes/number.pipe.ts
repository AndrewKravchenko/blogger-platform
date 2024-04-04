import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class NumberPipe implements PipeTransform {
  transform(value: any) {
    const num = Number(value)
    console.log('num', num)
    if (isNaN(num)) {
      throw new BadRequestException('Not a number')
    }

    return num
  }
}
