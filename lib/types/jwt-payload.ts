import { UserProvider } from 'src/services/users/types/user-provider'

export interface JwtPayload {
  id: string
  username: string
  email: string
  verified: string | null
  providers: UserProvider
}
