import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { User } from 'lib/decorators/user.decorator'

@ApiTags('Информация о пользователях')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @ApiOperation({
    summary: 'Существует ли пользователь с таким именем',
  })
  @ApiResponse({ status: 200, type: Boolean })
  @Get(':username')
  findByUsername(
    @Param('username') username: string,
    @User('username') existingUsername: string,
  ) {
    return this.usersService.checkUsername(username, existingUsername)
  }
}
