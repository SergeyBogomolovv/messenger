import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ProfileResponse } from './responses/user.response'
import { User } from 'lib/decorators/user.decorator'
import { JwtGuard } from 'lib/guards/jwt.guard'

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
}
