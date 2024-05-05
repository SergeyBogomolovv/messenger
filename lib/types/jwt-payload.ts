import { $Enums } from '@prisma/client'

export interface JwtPayload {
  id: string
  username: string
  email: string
  verified: string | null
  provider: $Enums.Provider
}
