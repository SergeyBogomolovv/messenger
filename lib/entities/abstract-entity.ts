import { PrimaryGeneratedColumn } from 'typeorm'

export class AbstractEntity<Entity> {
  @PrimaryGeneratedColumn('uuid')
  id: string
  constructor(token: Partial<Entity>) {
    Object.assign(this, token)
  }
}
