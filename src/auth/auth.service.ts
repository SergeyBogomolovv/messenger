import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { LoginDto } from './dto/login.dto'
import { compareSync } from 'bcrypt'
import { TokensService } from 'src/tokens/tokens.service'
import * as uuid from 'uuid'
import { MailService } from 'src/mail/mail.service'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/prisma/prisma.service'
import { RegistrationDto } from './dto/registration.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokensService: TokensService,
    private mailService: MailService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async registration(dto: RegistrationDto) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: dto.username }, { email: dto.email }] },
    })
    if (user) throw new ConflictException('Такой пользователь уже существует')
    const verifyLink = uuid.v4()
    this.mailService.sendActivationMail({
      to: dto.email,
      link: `${this.configService.get('server_url')}/auth/verify-email/${verifyLink}`,
    })
    await this.usersService.create({ ...dto, verifyLink })
    return { message: 'Письмо с подтверждением выслано вам на почту' }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findOne(dto.email)
    if (
      !user ||
      user.provider !== 'Credentials' ||
      !compareSync(dto.password, user.password)
    ) {
      throw new UnauthorizedException('Введены неверные данные')
    }
    if (!user.verified) {
      throw new UnauthorizedException('Подтвердите почту')
    }
    const accessToken = this.tokensService.generateAccessToken(user)
    const refreshToken = await this.tokensService.generateRefreshToken(user.id)
    return { accessToken, refreshToken }
  }

  async logout(token: string) {
    await this.tokensService.deleteRefreshToken(token)
    return { message: 'Вы успешно вышли из аккаунта' }
  }

  async refresh(token: string) {
    const validatedToken = await this.tokensService.validateRefreshToken(token)
    if (!validatedToken) throw new UnauthorizedException()
    const user = await this.usersService.findOne(validatedToken.userId)
    const accessToken = this.tokensService.generateAccessToken(user)
    return accessToken
  }

  async verifyEmail(verifyLink: string) {
    const user = await this.prisma.user.findUnique({
      where: { verifyLink },
    })
    if (!user) throw new UnauthorizedException()
    await this.prisma.user.update({
      where: { verifyLink },
      data: { verified: new Date() },
    })
  }

  async generateTokens(id: string) {
    const user = await this.usersService.findOne(id)
    if (!user) throw new BadRequestException()
    const accessToken = this.tokensService.generateAccessToken(user)
    const refreshToken = await this.tokensService.generateRefreshToken(user.id)
    return { accessToken, refreshToken }
  }
  async verifyRefreshToken(token: string) {
    const isToken = await this.tokensService.validateRefreshToken(token)
    return isToken ? true : false
  }
}
