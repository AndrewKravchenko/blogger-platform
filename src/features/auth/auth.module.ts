import { Module } from '@nestjs/common'
import { AuthController } from './api/auth.controller'
import { AuthService } from './application/auth.service'
import { UsersModule } from '../users/users.module'
import { JwtService } from '@nestjs/jwt'
import { EmailModule } from '../../infrastructure/emails/email.module'
import { SessionsModule } from '../sessions/sessions.module'
import { LoginStrategy } from './strategies/login.strategy'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'
import { ActiveSessionStrategy } from './strategies/active-session.strategy'

@Module({
  imports: [SessionsModule, UsersModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, LoginStrategy, AccessTokenStrategy, RefreshTokenStrategy, ActiveSessionStrategy, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
