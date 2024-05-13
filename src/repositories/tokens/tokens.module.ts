import { Module } from '@nestjs/common'
import { TokensService } from './tokens.service'
import { JwtGuard } from 'lib/guards/jwt.guard'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Token } from '../../models/token'

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [TokensService, JwtGuard],
  exports: [TokensService],
})
export class TokensModule {}
