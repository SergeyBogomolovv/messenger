import { AbstractEntity } from 'lib/entities/abstract-entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { User } from './user'

@Entity()
export class Token extends AbstractEntity<Token> {
  @Column()
  token: string
  @Column({ type: 'timestamptz' })
  exp: Date
  @Column()
  userId: string
  @ManyToOne(() => User, (user) => user.tokens)
  user: User
}
