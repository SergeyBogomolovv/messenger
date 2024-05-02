import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20'
import { PrismaService } from 'src/prisma/prisma.service'
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get('google.client'),
      clientSecret: configService.get('google.secret'),
      callbackURL: configService.get('google.callback'),
      scope: ['email', 'profile'],
    })
  }
  async validate(
    access: string,
    refresh: string,
    profile: Profile,
    done: VerifyCallback,
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
    done(null, user)
  }
}