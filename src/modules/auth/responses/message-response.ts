import { ApiProperty } from '@nestjs/swagger'

export class MessageResponse {
  @ApiProperty({
    example: 'Сообщение с информацией',
  })
  message: string
}
