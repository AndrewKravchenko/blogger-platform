import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../../features/auth/application/auth.service'
import { Request } from 'express'
import { Configuration } from '../../settings/configuration'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<Configuration, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const auth = request.headers.authorization

    if (!auth) {
      throw new UnauthorizedException()
    }

    const [basic, token] = auth.split(' ')

    if (basic !== 'Basic') {
      throw new UnauthorizedException()
    }

    const decodedData = Buffer.from(token, 'base64').toString()
    const [login, password] = decodedData.split(':')

    const { AUTH_LOGIN, AUTH_PASSWORD } = this.configService.get('basicCredentials', {
      infer: true,
    })

    if (login !== AUTH_LOGIN || password !== AUTH_PASSWORD) {
      throw new UnauthorizedException()
    }

    return true
  }
}

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>()
    const userId = this.authService.decodeUserIdFromToken(req)

    if (userId) {
      req.user = { id: userId }
      return true
    }

    throw new UnauthorizedException('Unauthorized')
  }
}
