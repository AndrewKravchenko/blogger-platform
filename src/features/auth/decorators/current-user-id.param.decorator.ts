import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'

export const CurrentUserId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()

  if (!request.user?.id) {
    throw new UnauthorizedException()
  }

  return request.user.id
})
