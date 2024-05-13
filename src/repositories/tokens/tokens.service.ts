import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Cache } from 'cache-manager'
import { add } from 'date-fns'
import { JwtPayload } from 'lib/types/jwt-payload'
import * as uuid from 'uuid'
import { Token } from '../../models/token'
import { Repository } from 'typeorm'
import { User } from '../../models/user'

@Injectable()
export class TokensService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateRefreshToken(token: string) {
    let existingToken = await this.cache.get<Token>(token)
    if (!existingToken) {
      existingToken = await this.tokensRepository.findOneBy({ token })
    }
    if (!existingToken) return null
    if (new Date(existingToken.exp) < new Date()) {
      await this.deleteRefreshToken(token)
      return null
    }
    return existingToken
  }

  async generateRefreshToken(userId: string): Promise<Token> {
    const token = new Token({
      token: uuid.v4(),
      exp: add(new Date(), { months: 1 }),
      userId,
    })
    await this.cache.set(token.token, token)
    return token
  }

  async getRefreshToken(token: string): Promise<Token> {
    let refreshToken = (await this.cache.get(token)) as Token
    if (!refreshToken) {
      refreshToken = await this.tokensRepository.findOneBy({ token })
      await this.cache.set(refreshToken.token, refreshToken)
    }
    return refreshToken
  }

  async deleteRefreshToken(token: string) {
    await this.cache.del(token)
    return await this.tokensRepository.delete({ token })
  }

  validateAccessToken(token: string) {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.config.get('auth.secret'),
    })
  }

  generateAccessToken(user: User) {
    return this.jwtService.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      verified: user.verified,
      providers: user.providers,
    })
  }
}
