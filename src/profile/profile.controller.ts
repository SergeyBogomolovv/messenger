import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ProfileGuard } from 'lib/guards/profile.guard'
import { ProfileService } from './profile.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ProfileResponse } from './responses/user.response'

@ApiTags('Информация о профиле')
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
  @ApiOperation({
    summary: 'Получение информации о профиле',
  })
  @ApiResponse({ status: 200, type: ProfileResponse })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @UseGuards(ProfileGuard)
  getUserProfile(@Param('id') id: string) {
    return this.profileService.getProfileInfo(id)
  }
}
