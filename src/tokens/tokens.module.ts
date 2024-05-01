import { Module } from '@nestjs/common'
import { TokensService } from './tokens.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('auth.secret'),
        signOptions: { expiresIn: config.get('auth.exp', '5m') },
      }),
    }),
  ],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
