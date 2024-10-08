import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Res, UseGuards } from '@nestjs/common'
import UAParser from 'ua-parser-js'
import { AuthService } from '../application/auth.service'
import { handleInterlayerResult, throwExceptionByInterlayerResultCode } from '../../../common/models/result-layer.model'
import { CurrentUserId } from '../decorators/current-user-id.param.decorator'
import { CurrentUser } from '../decorators/current-user.param.decorator'
import { ConfirmEmailInputModel, NewPasswordRecoveryInputModel, UserPayload } from './models/input/auth.input.model'
import { SignUpUserInputModel } from './models/input/create-auth.input.model'
import { MeOutputModel } from '../../users/api/models/output/user.output.model'
import { EmailPipe } from '../../../infrastructure/pipes/email.pipe'
import { AccessTokenAuthGuard } from '../guards/access-token-auth.guard'
import { LoginAuthGuard } from '../guards/login-auth.guard'
import { seconds, Throttle } from '@nestjs/throttler'
import { ActiveSessionAuthGuard } from '../guards/active-session-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AccessTokenAuthGuard)
  @Get('me')
  async getMe(@CurrentUserId() currentUserId: string): Promise<MeOutputModel | void> {
    const result = await this.authService.getMe(currentUserId)
    return handleInterlayerResult(result)
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @UseGuards(LoginAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Ip() ip: string,
    @CurrentUserId() currentUserId: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res,
  ): Promise<{ accessToken: string } | void> {
    const { browser } = new UAParser(userAgent).getResult()
    const deviceName = `${browser.name || 'Unknown'}`
    const result = await this.authService.login(currentUserId, ip, deviceName)

    if (result.hasError() || !result.data) {
      return throwExceptionByInterlayerResultCode(result.code, result.errorMessages)
    }

    res.cookie('refreshToken', result.data.refreshToken, { httpOnly: true, secure: true })
    return { accessToken: result.data.accessToken }
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUp(@Body() userInputModel: SignUpUserInputModel): Promise<{ accessToken: string } | void> {
    const result = await this.authService.signUp(userInputModel)
    return handleInterlayerResult(result)
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(@Body() { code: confirmCode }: ConfirmEmailInputModel): Promise<void> {
    const result = await this.authService.confirmEmail(confirmCode)
    return handleInterlayerResult(result)
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body('email', EmailPipe) email: string): Promise<void> {
    const result = await this.authService.resendRegistrationEmail(email)
    return handleInterlayerResult(result)
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body('email', EmailPipe) email: string): Promise<void> {
    const result = await this.authService.resetPassword(email)
    return handleInterlayerResult(result)
  }

  @Throttle({ default: { limit: 5, ttl: seconds(10) } })
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserPassword(@Body() newPasswordRecovery: NewPasswordRecoveryInputModel): Promise<void> {
    const result = await this.authService.changePassword(newPasswordRecovery)
    return handleInterlayerResult(result)
  }

  @UseGuards(ActiveSessionAuthGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(
    @Ip() ip: string,
    @CurrentUser() { userId, deviceId }: UserPayload,
    @Res({ passthrough: true }) res,
  ): Promise<{ accessToken: string } | void> {
    const result = await this.authService.refreshAccessToken(userId, deviceId, ip)

    if (result.hasError() || !result.data) {
      return throwExceptionByInterlayerResultCode(result.code, result.errorMessages)
    }

    res.cookie('refreshToken', result.data.refreshToken, { httpOnly: true, secure: true })
    return { accessToken: result.data.accessToken }
  }

  @UseGuards(ActiveSessionAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() { userId, deviceId }: UserPayload, @Res({ passthrough: true }) res): Promise<void> {
    await this.authService.logout(userId, deviceId)
    res.clearCookie('refreshToken')
  }
}
