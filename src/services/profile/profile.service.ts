import { BadRequestException, Injectable } from '@nestjs/common'
import { ProfileResponse } from './responses/user.response'
import { UpdateProfileInput } from './dto/update-profile.dto'
import { CloudService } from 'src/modules/cloud/cloud.service'
import { ConfigService } from '@nestjs/config'
import { UsersService } from 'src/repositories/users/users.service'

@Injectable()
export class ProfileService {
  constructor(
    private readonly cloud: CloudService,
    private readonly config: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async getProfileInfo(id: string) {
    const user = await this.userService.findById(id)
    return new ProfileResponse(user)
  }

  async checkUsername(username: string, existingUsername?: string) {
    const existingUser = await this.userService.findByUsername(username)
    if (existingUser) {
      if (existingUsername) {
        if (existingUser.username === existingUsername) {
          return false
        }
      }
      return true
    }
    return false
  }

  async updateProfile(
    id: string,
    data: UpdateProfileInput,
    file: Express.Multer.File,
  ) {
    const existingUser = await this.userService.findById(id)
    const isUsernameExists = await this.userService.findByUsername(
      data.username,
    )
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
    const updatedUser = await this.userService.update(id, {
      ...data,
      logo: newLogo,
    })
    return updatedUser
  }
  async deleteUserProfile(id: string) {
    return await this.userService.delete(id)
  }
}
