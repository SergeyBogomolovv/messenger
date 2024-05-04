import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  Res,
  HttpStatus,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import { AuthService } from './auth.service'
import { Response, Request } from 'express'
import { Cookie } from 'lib/decorators/cookie.decorator'
import { GoogleAuth } from './strategies/google/google.guard'
import { RegistrationDto } from './dto/registration.dto'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AccessTokenResponse } from './responses/access-token.response'
import { MessageResponse } from './responses/message-response'

@ApiTags('Аунтефикация')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Вход через гугл',
    description:
      'Редиректит на страницу гугла, а потом на клиента с access токеном в query token и рефреш в куках',
  })
  @ApiResponse({ status: 300 })
  @Get('login/google')
  @UseGuards(GoogleAuth)
  async googleLogin() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuth)
  async googleCallback(@Req() request: Request, @Res() response: Response) {
    const user = request.user as User
    const tokens = await this.authService.generateTokens(user.id)
    return response
      .cookie('refreshToken', tokens.refreshToken.token, {
        httpOnly: true,
        sameSite: 'lax',
        expires: new Date(tokens.refreshToken.exp),
        secure: false,
        path: '/',
      })
      .redirect(
        `${this.configService.get('google.client_redirect')}?token=${tokens.accessToken}`,
      )
  }

  @ApiOperation({
    summary: 'Вход через почту и пароль',
    description: 'Ставит рефреш токен в куки и возвращает access',
  })
  @ApiResponse({ status: 200, type: AccessTokenResponse })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    const tokens = await this.authService.login(dto)
    if (!tokens) {
      throw new BadRequestException('Ошибка при входе, повторите еще раз')
    }
    return response
      .cookie('refreshToken', tokens.refreshToken.token, {
        httpOnly: true,
        sameSite: 'lax',
        expires: new Date(tokens.refreshToken.exp),
        secure: false,
        path: '/',
      })
      .status(HttpStatus.CREATED)
      .json({ accessToken: tokens.accessToken })
  }

  @ApiOperation({
    summary: 'Регистрация через почту и пароль',
    description: 'username и email должны быть уникальны',
  })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    const message = await this.authService.registration(dto)
    return message
  }

  @ApiOperation({
    summary: 'Рефреш информации',
    description: 'Возвращает новый access токен',
  })
  @ApiResponse({ status: 200, type: AccessTokenResponse })
  @Get('refresh')
  async refreshTokens(@Cookie('refreshToken') refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException()
    const accessToken = await this.authService.refresh(refreshToken)
    if (!accessToken) {
      throw new UnauthorizedException()
    }
    return { accessToken }
  }

  @Get('verify-email/:token')
  async verify(@Param('token') verifyLink: string, @Res() res: Response) {
    this.authService.verifyEmail(verifyLink)
    return res.redirect(this.configService.get('email_redirect'))
  }

  @ApiOperation({
    summary: 'Выход из учетной записи',
    description: 'Удаляет токен из куков и бд',
  })
  @ApiResponse({ status: 200, type: MessageResponse })
  @Get('logout')
  async logout(
    @Cookie('refreshToken') refreshToken: string,
    @Res() response: Response,
  ) {
    if (!refreshToken) {
      return response.sendStatus(HttpStatus.OK)
    }
    const message = await this.authService.logout(refreshToken)
    return response.clearCookie('refreshToken').json(message)
  }

  @ApiOperation({
    summary: 'Проверка токена',
    description:
      'Проверяет, действителен ли токен из куков, возвращает boolean, использовать для миддлвари',
  })
  @ApiResponse({ status: 200, type: Boolean })
  @Get('verify-token/:token')
  verifyRefreshToken(@Param('token') refreshToken: string) {
    if (!refreshToken) return false
    return this.authService.verifyRefreshToken(refreshToken)
  }
}
