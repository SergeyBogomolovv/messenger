import { Inject, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { hashSync } from 'bcrypt'
import { Cache } from 'cache-manager'
import { CreateUserInput } from './dto/create-user.input'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}
  create(user: CreateUserInput) {
    const hashedPassword = this.hashPassword(user.password)
    return this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    })
  }
  async findOne(idOrEmail: string) {
    const cachedUser: User = await this.cache.get(idOrEmail)
    if (!cachedUser) {
      const dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: idOrEmail }, { email: idOrEmail }],
        },
      })
      if (!dbUser) return null
      await this.cache.set(idOrEmail, dbUser, 60 * 1000)
      return dbUser
    }
    return cachedUser
  }
  async delete(id: string) {
    await this.cache.del(id)
    return this.prisma.user.delete({ where: { id } })
  }
  private hashPassword(password: string) {
    return hashSync(password, 7)
  }
}
