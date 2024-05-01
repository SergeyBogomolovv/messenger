import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from '@nestjs/cache-manager'
import { UsersModule } from './users/users.module'
import { TokensModule } from './tokens/tokens.module'
import { MailModule } from './mail/mail.module'
import { AuthModule } from './auth/auth.module'
import { CloudModule } from './cloud/cloud.module'
import app from './config/app'
import redis from './config/redis'
import auth from './config/auth'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [app, redis, auth],
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
    CloudModule,
  ],
})
export class AppModule {}
