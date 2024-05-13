import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from '../../models/conversation'
import { ConversationsService } from './conversations.service'

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
