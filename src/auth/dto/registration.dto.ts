import { IsEmail, IsString, Min } from 'class-validator'

export class RegistrationDto {
  @IsString()
  @Min(3)
  username: string
  @IsString()
  name: string
  @IsEmail()
  email: string
  @IsString()
  @Min(6)
  password?: string
}
