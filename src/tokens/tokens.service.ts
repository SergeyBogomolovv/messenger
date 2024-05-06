import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Token, User } from '@prisma/client'
import { Cache } from 'cache-manager'
import { add } from 'date-fns'
import { PrismaService } from 'src/prisma/prisma.service'
import * as uuid from 'uuid'

@Injectable()
export class TokensService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateRefreshToken(token: string) {
    let existingToken = (await this.cache.get(token)) as Token
    if (existingToken) {
      existingToken = await this.prisma.token.findUnique({ where: { token } })
    }
    if (!existingToken) return null
    if (new Date(existingToken.exp) < new Date()) {
      await this.deleteRefreshToken(token)
      return null
    }
    return existingToken
  }

  async generateRefreshToken(userId: string): Promise<Token> {
    const newToken = await this.prisma.token.create({
      data: { token: uuid.v4(), exp: add(new Date(), { months: 1 }), userId },
    })
    await this.cache.set(newToken.token, newToken)
    return newToken
  }

  async getRefreshToken(token: string): Promise<Token> {
    let refreshToken = (await this.cache.get(token)) as Token
    if (!refreshToken) {
      refreshToken = await this.prisma.token.findUnique({ where: { token } })
      await this.cache.set(refreshToken.token, refreshToken)
    }
    return refreshToken
  }

  async deleteRefreshToken(token: string): Promise<Token> {
    await this.cache.del(token)
    return this.prisma.token.delete({ where: { token } })
  }

  generateAccessToken(user: User) {
    return this.jwtService.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      verified: user.verified,
      provider: user.provider,
    })
  }
}
