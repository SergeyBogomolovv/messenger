import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-google-oauth20'
import { PrismaService } from 'src/prisma/prisma.service'
import { TokensService } from 'src/tokens/tokens.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tokens: TokensService,
  ) {
    super({
      clientID: configService.get('google.client'),
      clientSecret: configService.get('google.secret'),
      callbackURL: configService.get('google.callback'),
      scope: ['email', 'profile'],
    })
  }
  async validate(
    first: unknown,
    second: unknown,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ) {
    const { _json } = profile
    let user = await this.prisma.user.findUnique({
      where: { email: _json.email },
    })
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: _json.email,
          username: _json.sub,
          name: _json.name,
          logo: _json.picture,
          verified: new Date(),
          provider: 'Google',
        },
      })
    }
    const refreshToken = await this.tokens.generateRefreshToken(user.id)
    done(null, { refreshToken })
  }
}
