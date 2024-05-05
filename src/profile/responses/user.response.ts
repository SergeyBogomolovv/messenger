import { ApiProperty } from '@nestjs/swagger'
import { $Enums, User } from '@prisma/client'
import { Exclude } from 'class-transformer'

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
  provider: $Enums.Provider[]
  @Exclude()
  password: string
  @Exclude()
  verified: string
  @Exclude()
  verifyLink: string
  @Exclude()
  updatedAt: string
  constructor(user: Partial<User>) {
    Object.assign(this, user)
  }
}
