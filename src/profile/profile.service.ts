import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { ProfileResponse } from './responses/user.response'

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}
  async getProfileInfo(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return new ProfileResponse(user)
  }
}
