import { Module } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { AwsModule } from 'src/aws/aws.module'

@Module({
  imports: [AwsModule],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
