import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../application/auth.service'
import { FullUserOutputModel } from '../../users/api/models/output/user.output.model'

@Injectable()
export class LoginStrategy extends PassportStrategy(Strategy, 'login') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'loginOrEmail' })
  }

  async validate(loginOrEmail: string, password: string): Promise<FullUserOutputModel> {
    const user = await this.authService.validateUser(loginOrEmail, password)

    if (!user || user.isDeleted || user.emailConfirmation) {
      throw new UnauthorizedException()
    }

    return user
  }
}
