import { AbstractEntity } from 'lib/entities/abstract-entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { User } from './user'
import { Conversation } from './conversation'

@Entity()
export class Message extends AbstractEntity<Message> {
  @Column()
  content: string

  @Column({ nullable: true })
  image?: string

  @ManyToOne(() => User, (user) => user.messages)
  author: User

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation
}
