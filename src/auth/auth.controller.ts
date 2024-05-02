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

//TODO caching
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

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

  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    const message = await this.authService.registration(dto)
    return message
  }

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
}
