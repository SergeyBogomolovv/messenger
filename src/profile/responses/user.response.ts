import { $Enums, User } from '@prisma/client'
import { Exclude } from 'class-transformer'

export class ProfileResponse {
  id: string
  username: string
  name: string
  about: string | null
  logo: string | null
  email: string
  provider: $Enums.Provider[]
  @Exclude()
  password: string
  @Exclude()
  verified: string
  @Exclude()
  verifyLink: string
  @Exclude()
  updatedAt: string
  constructor(user: Partial<User>) {
    Object.assign(this, user)
  }
}
