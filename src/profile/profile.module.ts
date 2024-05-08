import { Module } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { CloudModule } from 'src/cloud/cloud.module'

@Module({
  imports: [CloudModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
