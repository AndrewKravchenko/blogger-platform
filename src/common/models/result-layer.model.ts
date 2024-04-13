import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

export enum ResultCode {
  Success,
  BadRequest,
  Unauthorized,
  NotFound,
  Forbidden,
}

export type FieldError = {
  message: string
  field: string
}

export class Result<T = null> {
  resultCode: ResultCode
  errorMessages?: FieldError[]
  data?: T

  constructor(resultCode: ResultCode, errorMessages?: FieldError[], data?: T) {
    this.resultCode = resultCode
    this.errorMessages = errorMessages
    this.data = data
  }
}

export const throwExceptionByResultCode = (resultCode: ResultCode, errorMessages?: FieldError[]): void => {
  switch (resultCode) {
    case ResultCode.NotFound:
      throw new NotFoundException(errorMessages)

    case ResultCode.Unauthorized:
      throw new UnauthorizedException(errorMessages)

    case ResultCode.Forbidden:
      throw new ForbiddenException(errorMessages)

    case ResultCode.BadRequest:
      throw new BadRequestException(errorMessages)

    default:
      throw new InternalServerErrorException(errorMessages)
  }
}
