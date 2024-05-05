import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProfileResponse } from './responses/user.response'
import { UpdateProfileInput } from './entities/update-profile.input'
import { AwsService } from 'src/aws/aws.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aws: AwsService,
    private readonly config: ConfigService,
  ) {}
  async getProfileInfo(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return new ProfileResponse(user)
  }

  async updateProfile(id: string, data: UpdateProfileInput) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } })
    const isUsernameExists = await this.prisma.user.findUnique({
      where: { username: data.username },
    })
    if (isUsernameExists && existingUser.id !== isUsernameExists.id)
      throw new BadRequestException(
        'Пользователь с таким никнеймом уже существует',
      )
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    })
    return updatedUser
  }

  async updateUserLogo(id: string, file: Express.Multer.File) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } })
    const logo = await this.aws.upload(file.buffer, 'logos')
    if (
      existingUser.logo &&
      existingUser.logo.includes(this.config.get('yandex.bucket'))
    ) {
      await this.aws.delete(existingUser.logo.split('.net/')[1])
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { logo },
    })
    return updatedUser
  }

  deleteUserProfile(id: string) {
    return this.prisma.user.delete({ where: { id } })
  }
}
