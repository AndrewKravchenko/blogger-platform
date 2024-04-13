import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Res, UseGuards } from '@nestjs/common'
import { LocalAuthGuard } from '../guards/local-auth.guard'
import UAParser from 'ua-parser-js'
import { AuthService } from '../application/auth.service'
import { ResultCode, throwExceptionByResultCode } from '../../../common/models/result-layer.model'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUserId } from '../decorators/current-user-id.param.decorator'
import { JwtCookieAuthGuard } from '../guards/jwt-cookie-auth.guard'
import { CurrentUser } from '../decorators/current-user.param.decorator'
import { ConfirmEmailInputModel, NewPasswordRecoveryInputModel, UserPayload } from './models/input/auth.input.model'
import { SignUpUserInputModel } from './models/input/create-auth.input.model'
import { MeOutputModel } from '../../users/api/models/output/user.output.model'
import { EmailPipe } from '../../../infrastructure/pipes/email.pipe'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUserId() currentUserId: string): Promise<MeOutputModel | void> {
    const { resultCode, data } = await this.authService.getMe(currentUserId)
    if (resultCode === ResultCode.Success) {
      return data
    }

    return throwExceptionByResultCode(resultCode)
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Ip() ip: string,
    @CurrentUserId() currentUserId: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) res,
  ): Promise<{ accessToken: string } | void> {
    const { browser } = new UAParser(userAgent).getResult()
    const deviceName = `${browser.name} ${browser.version}`
    const { resultCode, data } = await this.authService.login(currentUserId, ip, deviceName)

    if (resultCode === ResultCode.Success && data) {
      res.cookie('refreshToken', data.refreshToken, { httpOnly: true, secure: true })
      return { accessToken: data.accessToken }
    }

    return throwExceptionByResultCode(resultCode)
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signUp(@Body() userInputModel: SignUpUserInputModel): Promise<{ accessToken: string } | void> {
    const { resultCode, errorMessages } = await this.authService.signUp(userInputModel)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmEmail(@Body() { code }: ConfirmEmailInputModel): Promise<void> {
    const { resultCode, errorMessages } = await this.authService.confirmEmail(code)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(@Body('email', EmailPipe) email: string): Promise<void> {
    const { resultCode, errorMessages } = await this.authService.resendRegistrationEmail(email)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body('email', EmailPipe) email: string): Promise<void> {
    const { resultCode, errorMessages } = await this.authService.resetPassword(email)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserPassword(@Body() newPasswordRecovery: NewPasswordRecoveryInputModel): Promise<void> {
    const { resultCode, errorMessages } = await this.authService.changePassword(newPasswordRecovery)

    if (resultCode !== ResultCode.Success) {
      return throwExceptionByResultCode(resultCode, errorMessages)
    }
  }

  @UseGuards(JwtCookieAuthGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refreshAccessToken(
    @Ip() ip: string,
    @CurrentUser() { userId, deviceId }: UserPayload,
    @Res({ passthrough: true }) res,
  ): Promise<{ accessToken: string } | void> {
    const { resultCode, data, errorMessages } = await this.authService.refreshAccessToken(userId, deviceId, ip)

    if (resultCode === ResultCode.Success && data) {
      res.cookie('refreshToken', data.refreshToken, { httpOnly: true, secure: true })
      return { accessToken: data.accessToken }
    }

    return throwExceptionByResultCode(resultCode, errorMessages)
  }

  @UseGuards(JwtCookieAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() { deviceId }: UserPayload, @Res({ passthrough: true }) res): Promise<void> {
    await this.authService.logout(deviceId)
    res.clearCookie('refreshToken')
  }
}
