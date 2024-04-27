import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { SessionOutputModel } from './models/output/session.output.model'
import { SessionsService } from '../application/sessions.service'
import { InputDeviceIdModel } from './models/input/session.input.model'
import { handleInterlayerResult } from '../../../common/models/result-layer.model'
import { RefreshTokenAuthGuard } from '../../auth/guards/refresh-token-auth.guard'
import { CurrentUserId } from '../../auth/decorators/current-user-id.param.decorator'
import { CurrentUser } from '../../auth/decorators/current-user.param.decorator'
import { UserPayload } from '../../auth/api/models/input/auth.input.model'

@Controller('security')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(RefreshTokenAuthGuard)
  @Get('devices')
  async getSessions(@CurrentUserId() currentUserId: string): Promise<SessionOutputModel[]> {
    return await this.sessionsService.getSessions(currentUserId)
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSessionByDeviceId(
    @CurrentUserId() currentUserId: string,
    @Param() { deviceId }: InputDeviceIdModel,
  ): Promise<void> {
    const result = await this.sessionsService.deleteSessionByDeviceId(currentUserId, deviceId)
    return handleInterlayerResult(result)
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSessions(@CurrentUser() { userId, deviceId }: UserPayload): Promise<void> {
    await this.sessionsService.deleteSessions(userId, deviceId)
  }
}
