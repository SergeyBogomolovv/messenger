import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { LoginDto } from './dto/login.dto'
import { compareSync } from 'bcrypt'
import * as uuid from 'uuid'
import { ConfigService } from '@nestjs/config'
import { RegistrationDto } from './dto/registration.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { UsersService } from 'src/repositories/users/users.service'
import { TokensService } from 'src/repositories/tokens/tokens.service'
import { UserProvider } from 'src/repositories/users/types/user-provider'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async registration(dto: RegistrationDto) {
    const isEmailExists = await this.usersService.findByEmail(dto.email)
    if (isEmailExists)
      throw new ConflictException('Такой пользователь уже существует')

    const isUsernameExists = await this.usersService.findByUsername(
      dto.username,
    )
    if (isUsernameExists)
      throw new ConflictException('Такой пользователь уже существует')

    const verifyLink = uuid.v4()

    this.eventEmitter.emit('send_activation_email', {
      to: dto.email,
      link: `${this.configService.get('server_url')}/auth/verify-email/${verifyLink}`,
    })

    const newUser = await this.usersService.createWithPassword({
      ...dto,
      verifyLink,
    })

    await this.cache.set(newUser.email, newUser)
    return { message: 'Письмо с подтверждением выслано вам на почту' }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (
      !user ||
      !user.providers.includes(UserProvider.Credentials) ||
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
    const user = await this.usersService.findById(validatedToken.userId)
    const accessToken = this.tokensService.generateAccessToken(user)
    return accessToken
  }

  async verifyEmail(verifyLink: string) {
    const user = await this.usersService.findByVerifyLink(verifyLink)
    if (!user) throw new UnauthorizedException()
    await this.usersService.setVerified(user.id, new Date())
  }

  async generateTokens(id: string) {
    const user = await this.usersService.findById(id)
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
