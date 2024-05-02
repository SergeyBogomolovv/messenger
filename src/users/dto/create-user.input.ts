import { IsString, MinLength } from 'class-validator'

export class CreateUserInput {
  @IsString()
  username: string
  @IsString()
  email: string
  @IsString()
  name: string
  @IsString()
  @MinLength(6)
  password: string
  @IsString()
  verifyLink: string
}
