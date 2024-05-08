import { Global, Module } from '@nestjs/common'
import { CloudService } from './cloud.service'

@Global()
@Module({
  providers: [CloudService],
  exports: [CloudService],
})
export class CloudModule {}
