import { Injectable } from '@nestjs/common'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { CreateAccessToken, CreateRefreshToken } from '../models/input/auth.input.model'
import { ObjectId } from 'mongodb'
import { Request } from 'express'

@Injectable()
export class AuthService {
  constructor() {}

  generateAccessToken(accessTokenPayload: CreateAccessToken) {
    return jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {
      expiresIn: 15 * 60 * 1000,
      issuer: 'api.blogs.com',
      audience: 'blogs.com',
    })
  }

  async generateRefreshToken(refreshTokenPayload: CreateRefreshToken) {
    const expiresInSeconds = 24 * 60 * 60 * 1000

    return jwt.sign(refreshTokenPayload, process.env.JWT_SECRET, {
      expiresIn: expiresInSeconds,
      issuer: 'api.blogs.com',
      audience: 'blogs.com',
    })
  }

  // static async generateTokens(payload: TokenPayload, deviceId?: string): Promise<FreshTokens> {
  //   const refreshToken = await this.generateRefreshToken(payload, deviceId)
  //   const accessToken = this.generateAccessToken(payload)
  //
  //   return {
  //     accessToken,
  //     refreshToken,
  //   }
  // }

  verifyToken(token?: string): JwtPayload | null {
    if (!token) {
      return null
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)

      if (typeof payload !== 'object') {
        return null
      }

      return payload
    } catch (e) {
      return null
    }
  }

  decodeToken(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload
  }

  decodeUserIdFromToken(req: Request): string | null {
    const auth = req.headers['authorization']

    if (!auth) {
      return null
    }

    const token = auth.split(' ')[1]
    const { userId } = this.verifyToken(token) || {}

    if (userId && ObjectId.isValid(userId)) {
      return userId
    }

    return null
  }
}
