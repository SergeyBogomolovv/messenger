import { IsEmail, IsUUID } from 'class-validator'

export class ActivationMailInput {
  @IsUUID()
  readonly link: string
  @IsEmail()
  readonly to: string
}
