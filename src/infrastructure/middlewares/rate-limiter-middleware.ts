import { NextFunction, Request, Response } from 'express'
import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { RequestLogsRepository } from '../../features/requests/infrastructure/request-logs.repository'
import { RequestLog } from '../../features/requests/domain/request-log.entity'

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  constructor(private readonly requestLogsRepository: RequestLogsRepository) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { ip = '', originalUrl } = req
    const currentTime = new Date().getTime()
    const tenSecondsAgo = new Date(currentTime - 10 * 1000)

    const requestCount = await this.requestLogsRepository.getRequestLogs({
      ip,
      url: originalUrl,
      date: tenSecondsAgo,
    })

    if (requestCount >= 5) {
      throw new HttpException('', HttpStatus.TOO_MANY_REQUESTS)
    }

    const newRequestLog = new RequestLog({
      ip,
      url: originalUrl,
      date: new Date(),
    })
    await this.requestLogsRepository.createRequestLogs(newRequestLog)

    next()
  }
}
