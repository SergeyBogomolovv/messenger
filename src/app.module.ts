import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from '@nestjs/cache-manager'
import { TokensModule } from './services/tokens/tokens.module'
import { MailModule } from './modules/mail/mail.module'
import { AuthModule } from './modules/auth/auth.module'
import { CloudModule } from './modules/cloud/cloud.module'
import { ProfileModule } from './modules/profile/profile.module'
import app from './config/app'
import redis from './config/redis'
import auth from './config/auth'
import mail from './config/mail'
import cloud from './config/cloud'
import google from './config/google'
import { JwtModule } from '@nestjs/jwt'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './services/users/users.module'
import postgres from './config/postgres'
import { User } from './services/users/entities/user'
import { Message } from './services/messages/entities/message'
import { Conversation } from './services/conversations/entities/conversation'
import { Token } from './services/tokens/entities/token'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        port: config.getOrThrow('postgres.port'),
        database: config.getOrThrow('postgres.database'),
        username: config.getOrThrow('postgres.username'),
        password: config.getOrThrow('postgres.password'),
        entities: [User, Message, Conversation, Token],
        synchronize: true,
      }),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('auth.secret'),
        signOptions: { expiresIn: config.get('auth.exp', '5m') },
      }),
    }),
    ConfigModule.forRoot({
      load: [app, redis, auth, mail, cloud, google, postgres],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          ttl: 3 * 60 * 1000,
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
    UsersModule,
    TokensModule,
    MailModule,
    AuthModule,
    CloudModule,
    ProfileModule,
  ],
})
export class AppModule {}
