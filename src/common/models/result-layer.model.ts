import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

export enum InterlayerResultCode {
  Success,
  BadRequest,
  Unauthorized,
  NotFound,
  Forbidden,
}

export class InterlayerResult<D = null> {
  data: D | null = null
  code = InterlayerResultCode.Success
  errorMessages: InterlayerErrorMessage[]

  constructor(
    data: D | null = null,
    code = InterlayerResultCode.Success,
    errorMessages: InterlayerErrorMessage[] = [],
  ) {
    this.data = data
    this.code = code
    this.errorMessages = errorMessages
  }

  static Ok<D>(data?: D): InterlayerResult<D> {
    return new InterlayerResult<D>(data)
  }

  static Error(code: InterlayerResultCode, field?: string, message?: string): InterlayerResult {
    let errorMessages: InterlayerErrorMessage[] = []

    if (field && message) {
      errorMessages = [new InterlayerErrorMessage(message, field)]
    }

    return new InterlayerResult(null, code, errorMessages)
  }

  hasError(): boolean {
    return this.code !== InterlayerResultCode.Success
  }
}

export class InterlayerErrorMessage {
  public readonly message: string
  public readonly field: string

  constructor(message: string, field: string) {
    this.message = message
    this.field = field
  }
}

export const handleInterlayerResult = <D>(result: InterlayerResult<D>) => {
  if (result.hasError()) {
    return throwExceptionByInterlayerResultCode(result.code, result.errorMessages)
  }

  return result.data || undefined
}

export const throwExceptionByInterlayerResultCode = (
  resultCode: InterlayerResultCode,
  errorMessages?: InterlayerErrorMessage[],
): void => {
  switch (resultCode) {
    case InterlayerResultCode.NotFound:
      throw new NotFoundException(errorMessages)

    case InterlayerResultCode.Unauthorized:
      throw new UnauthorizedException(errorMessages)

    case InterlayerResultCode.Forbidden:
      throw new ForbiddenException(errorMessages)

    case InterlayerResultCode.BadRequest:
      throw new BadRequestException(errorMessages)

    default:
      throw new InternalServerErrorException(errorMessages)
  }
}
