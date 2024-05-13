import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Cache } from 'cache-manager'
import { Repository } from 'typeorm'
import { Conversation } from '../../models/conversation'

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(Conversation)
    private tokensRepository: Repository<Conversation>,
    private config: ConfigService,
  ) {}
}
