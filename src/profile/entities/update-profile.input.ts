import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class UpdateProfileInput {
  @ApiProperty({
    example: 'gerax',
    description: 'уникальный юзернейм',
  })
  @IsString()
  @MinLength(3)
  username?: string
  @ApiProperty({
    example: 'Иван',
    description: 'любое имя',
  })
  @IsString()
  @MinLength(3)
  name?: string
  @ApiProperty({
    example: 'О пользователе',
    description: 'О пользователе',
  })
  @IsString()
  about?: string
}
