import { registerAs } from '@nestjs/config'

export default registerAs('yandex', () => {
  return {
    secret: process.env.YANDEX_SECRET,
    access: process.env.YANDEX_ACCES,
    bucket: process.env.YANDEX_BUCKET,
  }
})
