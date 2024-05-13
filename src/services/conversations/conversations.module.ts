import { Module } from '@nestjs/common'
import { JwtGuard } from 'lib/guards/jwt.guard'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from './entities/conversation'
import { ConversationsService } from './conversations.service'

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  providers: [ConversationsService, JwtGuard],
  exports: [ConversationsService],
})
export class TokensModule {}
