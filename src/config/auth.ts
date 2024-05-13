import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => {
  return {
    secret: process.env.JWT_SECRET,
    exp: process.env.JWT_EXP,
  }
})
