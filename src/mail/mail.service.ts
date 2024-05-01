import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ActivationMailInput } from './dto/activation-mail.input'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  sendActivationMail(dto: ActivationMailInput) {
    this.mailerService.sendMail({
      to: dto.to,
      subject: `Verify your email`,
      text: '',
      html: `
        <div>
          <h1>To verify your account go <a href=${dto.link}>here</a></h1>
        </div>
    `,
    })
  }
}
