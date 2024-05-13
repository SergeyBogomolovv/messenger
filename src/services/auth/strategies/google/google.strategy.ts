import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Cache } from 'cache-manager'
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20'
import { UserProvider } from 'src/repositories/users/types/user-provider'
import { UsersService } from 'src/repositories/users/users.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    configService: ConfigService,
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
    let user = await this.userService.findByEmail(_json.email)
    if (user && !user.providers.includes(UserProvider.Google)) {
      await this.userService.addProvider(_json.email, UserProvider.Google)
    }
    if (!user) {
      user = await this.userService.createWithOAuth(
        {
          email: _json.email,
          name: _json.name,
          logo: _json.picture,
          username: _json.sub,
        },
        UserProvider.Google,
      )
    }
    done(null, user)
  }
}
