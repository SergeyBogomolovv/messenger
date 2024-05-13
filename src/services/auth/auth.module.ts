import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { MailModule } from 'src/modules/mail/mail.module'
import { GoogleStrategy } from './strategies/google/google.strategy'
import { GoogleAuth } from './strategies/google/google.guard'
import { UsersModule } from 'src/repositories/users/users.module'
import { TokensModule } from 'src/repositories/tokens/tokens.module'

@Module({
  imports: [UsersModule, TokensModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GoogleAuth],
})
export class AuthModule {}
