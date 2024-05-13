import { AbstractEntity } from 'lib/entities/abstract-entity'
import { Message } from 'src/services/messages/entities/message'
import { User } from 'src/services/users/entities/user'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'

@Entity()
export class Conversation extends AbstractEntity<Conversation> {
  @Column({ default: false })
  isGroup: boolean

  @Column()
  title: string

  @Column({ nullable: true })
  logo?: string

  @Column({ type: 'timestamptz' })
  lastMessageAt: Date

  @ManyToMany(() => User)
  @JoinTable()
  consumers: User[]

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages: Message[]
}
