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

  @Column({ type: 'timestamptz', default: new Date() })
  createdAt: Date

  @Column()
  seen?: boolean

  @ManyToOne(() => User, (user) => user.messages)
  author: User

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation
}
