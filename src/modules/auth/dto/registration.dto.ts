import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegistrationDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'почта',
  })
  @IsEmail()
  email: string
  @ApiProperty({
    example: 'grekassoq',
    description: 'уникальный юзернейм',
  })
  @IsString()
  username: string
  @ApiProperty({
    example: 'Gerax',
    description: 'Отображаемое имя',
  })
  @IsString()
  name: string
  @ApiProperty({
    example: '123456',
    description: 'пароль, минимум 6 символов',
  })
  @IsString()
  @MinLength(6)
  password: string
}
