import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { Configuration } from '../../../settings/configuration'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
  constructor(private readonly configService: ConfigService<Configuration, true>) {
    const secretOrKey = configService.get('jwtSettings.JWT_SECRET', {
      infer: true,
    })

    super({
      jwtFromRequest: (req: Request) => {
        if (req.cookies?.['refreshToken']) {
          return req.cookies['refreshToken']
        }
        return null
      },
      ignoreExpiration: false,
      secretOrKey,
    })
  }

  async validate(payload: any) {
    if (!payload.userId || !payload.deviceId) {
      throw new UnauthorizedException()
    }

    return { id: payload.userId, deviceId: payload.deviceId }
  }
}
