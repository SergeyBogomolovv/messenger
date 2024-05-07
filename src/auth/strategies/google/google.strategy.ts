import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Cache } from 'cache-manager'
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {
    super({
      clientID: configService.get('google.client'),
      clientSecret: configService.get('google.secret'),
      callbackURL: configService.get('google.callback'),
      scope: ['email', 'profile'],
    })
  }

  async validate(_, __, profile: Profile, done: VerifyCallback) {
    const { _json } = profile
    let user = await this.userService.findOne(_json.email)
    if (user && !user.provider.includes('Google')) {
      await this.prisma.user.update({
        where: { email: _json.email },
        data: { provider: { push: 'Google' } },
      })
    }
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: _json.email,
          username: _json.sub,
          name: _json.name,
          logo: _json.picture,
          verified: new Date(),
          provider: ['Google'],
        },
      })
    }
    done(null, user)
  }
}
