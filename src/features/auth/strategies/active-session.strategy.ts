import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { Configuration } from '../../../settings/configuration'
import { SessionsSqlRepository } from '../../sessions/infrastructure/sessions.sql-repository'

@Injectable()
export class ActiveSessionStrategy extends PassportStrategy(Strategy, 'active-session') {
  constructor(
    private readonly sessionsSqlRepository: SessionsSqlRepository,
    private readonly configService: ConfigService<Configuration, true>,
  ) {
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

    const { userId, deviceId, iat } = payload
    const session = await this.sessionsSqlRepository.getSessionByDeviceId(deviceId)

    if (!session) {
      throw new UnauthorizedException()
    }

    const lastActiveDate = iat * 1000
    const isActiveSession = lastActiveDate === session.lastActiveDate.getTime()

    if (!isActiveSession) {
      throw new UnauthorizedException()
    }
    if (userId !== session.userId) {
      throw new ForbiddenException()
    }

    return { id: payload.userId, deviceId: payload.deviceId }
  }
}
