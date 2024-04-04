import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { AuthService } from '../../features/auth/application/auth.service'

@Injectable()
export class DecodeUserIdMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const userId = this.authService.decodeUserIdFromToken(req)

    if (userId) {
      req.userId = userId
    }

    next()
  }
}
