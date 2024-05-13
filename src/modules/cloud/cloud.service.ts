import { Injectable } from '@nestjs/common'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { v4 as uuid } from 'uuid'
import { UploadImageDto } from './dto/upload-image.dto'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class CloudService {
  private readonly s3Client = new S3Client({
    region: 'ru-central1',
    endpoint: 'https://storage.yandexcloud.net',
    credentials: {
      accessKeyId: this.config.get('yandex.access'),
      secretAccessKey: this.config.get('yandex.secret'),
    },
  })
  constructor(private readonly config: ConfigService) {}
  async upload(dto: UploadImageDto) {
    const fileName = uuid() + '.jpg'
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.config.get('yandex.bucket'),
        Body: dto.file,
        Key: `${dto.path}/${fileName}`,
      }),
    )
    return `https://${this.config.get('yandex.bucket')}.storage.yandexcloud.net/${dto.path}/${fileName}`
  }
  @OnEvent('delete_image')
  async delete(path: string) {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.get('yandex.bucket'),
          Key: path,
        }),
      )
      return true
    } catch (error) {
      return false
    }
  }
}
