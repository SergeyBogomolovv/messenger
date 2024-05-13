import { AbstractEntity } from 'lib/entities/abstract-entity'
import { Conversation } from 'src/services/conversations/entities/conversation'
import { User } from 'src/services/users/entities/user'
import { Column, Entity, ManyToOne } from 'typeorm'

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
