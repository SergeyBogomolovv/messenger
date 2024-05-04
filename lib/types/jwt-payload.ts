import { $Enums } from '@prisma/client'

export interface JwtPayload {
  id: string
  logo: string | null
  name: string
  username: string
  email: string
  verified: string | null
  provider: $Enums.Provider
}
