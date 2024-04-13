import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { UserPayload } from '../api/models/input/auth.input.model'

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): UserPayload => {
  const request = ctx.switchToHttp().getRequest()

  if (!request.user?.id || !request.user?.deviceId) {
    throw new UnauthorizedException()
  }

  return {
    userId: request.user.id,
    deviceId: request.user.deviceId,
  }
})
