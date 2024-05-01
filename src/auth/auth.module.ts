import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from 'src/users/users.module'
import { TokensModule } from 'src/tokens/tokens.module'
import { MailModule } from 'src/mail/mail.module'
import { GoogleStrategy } from './strategies/google.strategy'
import { GoogleAuth } from './strategies/google.guard'

@Module({
  imports: [UsersModule, TokensModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GoogleAuth],
})
export class AuthModule {}
