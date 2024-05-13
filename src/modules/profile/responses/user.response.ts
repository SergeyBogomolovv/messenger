import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { User } from 'src/services/users/entities/user'
import { UserProvider } from 'src/services/users/types/user-provider'

export class ProfileResponse {
  @ApiProperty({
    example: 'sjfsdf-sdfef-adsdf-sdf',
    description: 'id',
  })
  id: string
  @ApiProperty({
    example: 'gerax',
    description: 'уникальный юзернейм',
  })
  username: string
  @ApiProperty({
    example: 'Иван',
    description: 'Отображаемое имя',
  })
  name: string
  @ApiProperty({
    example: 'что то написано',
    description: 'О пользователе',
  })
  about: string | null
  @ApiProperty({
    example: 'ссылка на диск',
    description: 'логотип',
  })
  logo: string | null
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Почта',
  })
  email: string
  @ApiProperty({
    example: '[Google]',
    description: 'Подключенные аккаунты',
  })
  providers: UserProvider[]
  @Exclude()
  password: string
  @Exclude()
  verified: string
  @Exclude()
  verifyLink: string
  constructor(user: Partial<User>) {
    Object.assign(this, user)
  }
}
