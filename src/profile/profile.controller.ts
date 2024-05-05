import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ProfileService } from './profile.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ProfileResponse } from './responses/user.response'
import { User } from 'lib/decorators/user.decorator'
import { JwtGuard } from 'lib/guards/jwt.guard'
import { UpdateProfileInput } from './entities/update-profile.input'
import { Response } from 'express'
import { MessageResponse } from 'src/auth/responses/message-response'

@ApiTags('Информация о профиле')
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  @ApiOperation({
    summary: 'Получение информации о профиле',
  })
  @ApiResponse({ status: 200, type: ProfileResponse })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @UseGuards(JwtGuard)
  getUserProfile(@User('id') id: string) {
    return this.profileService.getProfileInfo(id)
  }

  @ApiOperation({
    summary: 'Обновление информации профиля',
  })
  @ApiResponse({ status: 200, type: ProfileResponse })
  @Put()
  @UseGuards(JwtGuard)
  updateProfile(@User('id') id: string, @Body() data: UpdateProfileInput) {
    return this.profileService.updateProfile(id, data)
  }

  @ApiOperation({
    summary: 'Обновление аватарки профиля',
  })
  @UseInterceptors(FileInterceptor('logo'))
  @ApiResponse({ status: 200, type: ProfileResponse })
  @Put('logo')
  @UseGuards(JwtGuard)
  updateProfileLogo(
    @User('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profileService.updateUserLogo(id, file)
  }

  @ApiOperation({
    summary: 'Удаление профиля пользователя',
  })
  @UseInterceptors(FileInterceptor('logo'))
  @ApiResponse({ status: 200, type: MessageResponse })
  @Delete()
  @UseGuards(JwtGuard)
  async deleteProfile(@User('id') id: string, @Res() res: Response) {
    await this.profileService.deleteUserProfile(id)
    return res
      .clearCookie('refreshToken')
      .json({ message: 'Пользователь был удален' })
  }
}
