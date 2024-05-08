import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProfileResponse } from './responses/user.response'
import { UpdateProfileInput } from './entities/update-profile.input'
import { CloudService } from 'src/cloud/cloud.service'
import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class ProfileService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly prisma: PrismaService,
    private readonly cloud: CloudService,
    private readonly config: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async getProfileInfo(id: string) {
    const user = await this.userService.findOne(id)
    return new ProfileResponse(user)
  }

  async updateProfile(
    id: string,
    data: UpdateProfileInput,
    file: Express.Multer.File,
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } })
    const isUsernameExists = await this.prisma.user.findUnique({
      where: { username: data.username },
    })
    if (isUsernameExists && existingUser.id !== isUsernameExists.id)
      throw new BadRequestException(
        'Пользователь с таким никнеймом уже существует',
      )
    let newLogo = existingUser.logo
    if (file) {
      newLogo = await this.cloud.upload(file.buffer, 'logos')
      if (
        existingUser.logo &&
        existingUser.logo.includes(this.config.get('yandex.bucket'))
      ) {
        await this.cloud.delete(existingUser.logo.split('.net/')[1])
      }
    }
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { ...data, logo: newLogo },
    })
    await this.cache.set(id, updatedUser)
    return updatedUser
  }

  async deleteUserProfile(id: string) {
    return await this.userService.delete(id)
  }
}
