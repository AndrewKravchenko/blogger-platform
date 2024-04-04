export enum ResultCode {
  Success,
  BadRequest,
  Unauthorized,
  NotFound,
}

export class Result<T = null> {
  resultCode: ResultCode
  errorMessage?: string
  data?: T

  constructor(resultCode: ResultCode, errorMessage?: string, data?: T) {
    this.resultCode = resultCode
    this.errorMessage = errorMessage
    this.data = data
  }
}
