import { Module } from '@nestjs/common'
import { AuthController } from './api/auth.controller'
import { AuthService } from './application/auth.service'
import { UsersModule } from '../users/users.module'
import { JwtService } from '@nestjs/jwt'
import { EmailModule } from '../../infrastructure/emails/email.module'
import { SessionsModule } from '../sessions/sessions.module'
import { JwtCookieStrategy } from './strategies/jwt-cookie.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
  imports: [SessionsModule, UsersModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtCookieStrategy, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
