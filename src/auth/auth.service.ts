import {
  BadRequestException,
  ConflictException,
  Inject,
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
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private usersService: UsersService,
    private tokensService: TokensService,
    private mailService: MailService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async registration(dto: RegistrationDto) {
    const isEmailExists = await this.usersService.findOne(dto.email)
    if (isEmailExists)
      throw new ConflictException('Такой пользователь уже существует')

    const isUsernameExists = await this.usersService.findOne(dto.username)
    if (isUsernameExists)
      throw new ConflictException('Такой пользователь уже существует')

    const verifyLink = uuid.v4()
    this.mailService.sendActivationMail({
      to: dto.email,
      link: `${this.configService.get('server_url')}/auth/verify-email/${verifyLink}`,
    })

    const newUser = await this.usersService.create({ ...dto, verifyLink })
    await this.cache.set(newUser.email, newUser)
    return { message: 'Письмо с подтверждением выслано вам на почту' }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findOne(dto.email)
    if (
      !user ||
      !user.provider.includes('Credentials') ||
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
