import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from '@nestjs/cache-manager'
import { UsersModule } from './users/users.module';
import app from './config/app'
import redis from './config/redis'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [app, redis],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: async (config) => {
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
  ],
})
export class AppModule {}
