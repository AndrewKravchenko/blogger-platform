import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
// import { getCurrentDateISOString } from '../utils/common'

// https://docs.nestjs.com/exception-filters
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse: { errorsMessages: string[] } = {
        errorsMessages: [],
      }

      const responseBody: any = exception.getResponse()

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((e) => errorsResponse.errorsMessages.push(e))
      } else {
        errorsResponse.errorsMessages.push(responseBody.message)
      }

      response.status(status).json(errorsResponse)
    } else {
      response.sendStatus(status)
      // response.status(status).json({
      //   statusCode: status,
      //   timestamp: getCurrentDateISOString(),
      //   path: request.url,
      // })
    }
  }
}
