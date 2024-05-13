import { Inject, Injectable } from '@nestjs/common'
import { hashSync } from 'bcrypt'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { CreateUserWithPassword } from './dto/create-user-pass.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user'
import { Repository } from 'typeorm'
import { UserProvider } from './types/user-provider'
import { CreateUserWithOAuth } from './dto/create-user-oauth.dto'

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async createWithPassword(dto: CreateUserWithPassword) {
    const hashedPassword = this.hashPassword(dto.password)
    const user = new User(dto)
    user.password = hashedPassword
    user.providers = [UserProvider.Credentials]
    await this.userRepository.save(user)
    await this.cache.set(user.id, user)
    await this.cache.set(user.email, user)
    await this.cache.set(user.username, user)
    return user
  }
  async createWithOAuth(dto: CreateUserWithOAuth, provider: UserProvider) {
    const user = new User({ ...dto, verified: new Date() })
    user.providers = [provider]
    await this.userRepository.save(user)
    await this.cache.set(user.id, user)
    await this.cache.set(user.email, user)
    await this.cache.set(user.username, user)
    return user
  }
  async findById(id: string) {
    const cachedUser = await this.cache.get<User>(id)
    if (!cachedUser) {
      const dbUser = await this.userRepository.findOneBy({ id })
      if (!dbUser) return null
      await this.cache.set(id, dbUser)
      return dbUser
    }
    return cachedUser
  }
  async findByEmail(email: string) {
    const cachedUser = await this.cache.get<User>(email)
    if (!cachedUser) {
      const dbUser = await this.userRepository.findOneBy({ email })
      if (!dbUser) return null
      await this.cache.set(email, dbUser)
      return dbUser
    }
    return cachedUser
  }
  async findByUsername(username: string) {
    const cachedUser = await this.cache.get<User>(username)
    if (!cachedUser) {
      const dbUser = await this.userRepository.findOneBy({ username })
      if (!dbUser) return null
      await this.cache.set(username, dbUser)
      return dbUser
    }
    return cachedUser
  }
  async findByVerifyLink(verifyLink: string) {
    return await this.userRepository.findOne({ where: { verifyLink } })
  }
  async setVerified(id: string, date: Date) {
    const user = await this.userRepository.findOneBy({ id })
    user.verified = date
    await this.userRepository.save(user)
    await this.cache.set(user.id, user)
    await this.cache.set(user.email, user)
    await this.cache.set(user.username, user)
    return user
  }
  async update(id: string, data: Partial<User>) {
    let user = await this.userRepository.findOneBy({ id })
    user = { ...user, ...data }
    await this.userRepository.save(user)
    await this.cache.set(user.id, user)
    await this.cache.set(user.email, user)
    await this.cache.set(user.username, user)
    return user
  }
  async delete(id: string) {
    await this.cache.del(id)
    return await this.userRepository.delete({ id })
  }
  async addProvider(email: string, provider: UserProvider) {
    const user = await this.userRepository.findOneBy({ email })
    user.providers.push(provider)
    await this.userRepository.save(user)
    await this.cache.set(user.id, user)
    return user
  }
  private hashPassword(password: string) {
    return hashSync(password, 7)
  }
}
