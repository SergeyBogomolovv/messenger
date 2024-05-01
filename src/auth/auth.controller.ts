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
import { GoogleAuth } from './strategies/google.guard'
import { RegistrationDto } from './dto/registration.dto'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(GoogleAuth)
  @Get('login/google')
  async googleLogin() {}

  //тут переадресовывать на клиент с куками чтобы оттуда делать рефрешь
  @UseGuards(GoogleAuth)
  @Get('google/redirect')
  async googleCallback(@Req() request: Request, @Res() response: Response) {
    return response
      .cookie('refreshToken', request.user['refreshToken'].token, {
        httpOnly: true,
        sameSite: 'lax',
        expires: new Date(request.user['refreshToken'].exp),
        secure: false,
        path: '/',
      })
      .redirect(this.configService.get('google.client_redirect'))
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    const data = await this.authService.login(dto)
    if (!data) {
      throw new BadRequestException('Ошибка при входе, повторите еще раз')
    }
    response.cookie('refreshToken', data.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(data.refreshToken.exp),
      secure: false,
      path: '/',
    })
    return response
      .status(HttpStatus.CREATED)
      .json({ accesToken: data.accesToken, user: data.user })
  }

  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    const message = await this.authService.registration(dto)
    return message
  }

  @Get('refresh')
  async refreshTokens(@Cookie('refreshToken') refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException()
    const data = await this.authService.refresh(refreshToken)
    if (!data) {
      throw new BadRequestException('Unnable to refresh')
    }
    return { accesToken: data.accesToken, user: data.user }
  }

  @Get('verify-email/:token')
  async verify(@Param('token') verifyLink: string, @Res() res: Response) {
    this.authService.verifyEmail(verifyLink)
    return res.redirect(this.configService.get('email_redirect'))
  }

  @Get('logout')
  async logout(
    @Cookie('refreshToken') refreshToken: string,
    @Res() response: Response,
  ) {
    if (!refreshToken) {
      return response.sendStatus(HttpStatus.OK)
    }
    await this.authService.logout(refreshToken)
    response.clearCookie('refreshToken')
    return response.sendStatus(HttpStatus.OK)
  }
}
