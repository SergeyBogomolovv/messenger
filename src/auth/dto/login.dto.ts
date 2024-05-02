import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Почта',
  })
  @IsEmail()
  email: string
  @ApiProperty({
    example: '123456',
    description: 'Пароль',
  })
  @IsString()
  @MinLength(6)
  password: string
}
