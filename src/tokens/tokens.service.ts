import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Token, User } from '@prisma/client'
import { add } from 'date-fns'
import { PrismaService } from 'src/prisma/prisma.service'
import * as uuid from 'uuid'

@Injectable()
export class TokensService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateRefreshToken(token: string) {
    const dbToken = await this.prisma.token.findUnique({ where: { token } })
    if (!dbToken) return null
    if (new Date(dbToken.exp) < new Date()) {
      await this.deleteRefreshToken(token)
      return null
    }
    return dbToken
  }

  generateRefreshToken(userId: string): Promise<Token> {
    return this.prisma.token.create({
      data: { token: uuid.v4(), exp: add(new Date(), { months: 1 }), userId },
    })
  }

  getRefreshToken(token: string): Promise<Token> {
    return this.prisma.token.findUnique({ where: { token } })
  }

  deleteRefreshToken(token: string): Promise<Token> {
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
