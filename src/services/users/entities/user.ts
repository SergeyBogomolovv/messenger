import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { UserStatus } from '../types/user-status'
import { UserProvider } from '../types/user-provider'
import { Token } from 'src/services/tokens/entities/token'
import { AbstractEntity } from 'lib/entities/abstract-entity'
import { Conversation } from 'src/services/conversations/entities/conversation'
import { Message } from 'src/services/messages/entities/message'

@Entity()
export class User extends AbstractEntity<User> {
  @Column()
  username: string

  @Column()
  name: string

  @Column({ nullable: true })
  about?: string

  @Column({ nullable: true })
  logo?: string

  @Column({ nullable: true })
  password?: string

  @Column({ unique: true })
  email: string

  @Column({ type: 'timestamptz', nullable: true })
  verified?: Date

  @Column({ type: 'timestamptz', default: new Date() })
  createdAt: Date

  @Column({ unique: true, nullable: true })
  verifyLink?: string

  @Column({ default: UserStatus.offline })
  status: UserStatus

  @Column('text', { array: true })
  providers: UserProvider[]

  @OneToMany(() => Token, (token) => token.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  tokens: Token[]

  @OneToMany(() => Message, (msg) => msg.author, { cascade: true })
  messages: Message[]

  @ManyToMany(() => Conversation)
  @JoinTable()
  conversations: Conversation[]
}
