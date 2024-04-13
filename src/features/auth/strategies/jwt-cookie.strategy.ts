import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from '../application/auth.service'

@Injectable()
export class JwtCookieStrategy extends PassportStrategy(Strategy, 'jwt-cookie') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req.cookies?.['refreshToken']) {
          return req.cookies['refreshToken']
        }
        return null
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: any) {
    if (!payload.userId || !payload.deviceId) {
      throw new UnauthorizedException()
    }

    const { userId, deviceId, iat } = payload
    const isActiveSession = await this.authService.isActiveSession(userId, deviceId, iat)

    if (!isActiveSession) {
      throw new UnauthorizedException()
    }

    return { id: payload.userId, deviceId: payload.deviceId }
  }
}
