import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from '@nestjs/cache-manager'
import { UsersModule } from './users/users.module'
import { TokensModule } from './tokens/tokens.module'
import { MailModule } from './mail/mail.module'
import { AuthModule } from './auth/auth.module'
import { AwsModule } from './aws/aws.module'
import { ProfileModule } from './profile/profile.module'
import app from './config/app'
import redis from './config/redis'
import auth from './config/auth'
import mail from './config/mail'
import cloud from './config/cloud'
import google from './config/google'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('auth.secret'),
        signOptions: { expiresIn: config.get('auth.exp', '5m') },
      }),
    }),
    ConfigModule.forRoot({
      load: [app, redis, auth, mail, cloud, google],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          ttl: 10 * 1000,
          socket: {
            host: config.get('redis.host'),
            port: config.get('redis.port'),
          },
        })
        return { store }
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    TokensModule,
    MailModule,
    AuthModule,
    AwsModule,
    ProfileModule,
  ],
})
export class AppModule {}
