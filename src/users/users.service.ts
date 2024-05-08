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
  async create(user: CreateUserInput) {
    const hashedPassword = this.hashPassword(user.password)
    const newUser = await this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    })
    await this.cache.set(newUser.id, newUser)
    return newUser
  }

  async checkUsername(username: string, existingUsername?: string) {
    const existingUser = await this.findOne(username)
    if (existingUser) {
      if (existingUsername) {
        if (existingUser.username === existingUsername) {
          return false
        }
      }
      return true
    }
    return false
  }

  async findOne(slug: string) {
    const cachedUser: User = await this.cache.get(slug)
    if (!cachedUser) {
      const dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: slug }, { email: slug }, { username: slug }],
        },
      })
      if (!dbUser) return null
      await this.cache.set(slug, dbUser)
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
