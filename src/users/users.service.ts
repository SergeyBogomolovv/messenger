import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { hashSync } from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  create(user: Partial<User>) {
    const hashedPassword = this.hashPassword(user.password)
    return this.prisma.user.create({
      data: {
        ...user,
        name: user.name,
        username: user.username,
        email: user.email,
        verifyLink: user.verifyLink,
        password: hashedPassword,
      },
    })
  }
  findOne(idOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    })
  }
  delete(id: string) {
    return this.prisma.user.delete({ where: { id } })
  }
  private hashPassword(password: string) {
    return hashSync(password, 7)
  }
}
