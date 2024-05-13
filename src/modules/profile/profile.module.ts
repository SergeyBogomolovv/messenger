import { Module } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { CloudModule } from 'src/modules/cloud/cloud.module'
import { TokensModule } from 'src/services/tokens/tokens.module'
import { UsersModule } from 'src/services/users/users.module'

@Module({
  imports: [CloudModule, UsersModule, TokensModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
