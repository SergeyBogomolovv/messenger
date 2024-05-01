import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import EasyYandexS3 from 'easy-yandex-s3'
//TODO - Write own class with normal sdk
@Injectable()
export class CloudService extends EasyYandexS3 {
  constructor(private configService: ConfigService) {
    super({
      auth: {
        accessKeyId: configService.get('yandex.acces'),
        secretAccessKey: configService.get('yandex.secret'),
      },
      Bucket: configService.get('yandex.bucket'),
      debug: true,
    })
  }
  async uploadUserLogo(image: Express.Multer.File) {
    try {
      const upload: any = await this.Upload({ buffer: image.buffer }, '/logos/')
      return upload.key
    } catch (error) {
      return false
    }
  }
  async deleteUserLogo(path: string) {
    try {
      return this.Remove(path)
    } catch (error) {
      return false
    }
  }
}
