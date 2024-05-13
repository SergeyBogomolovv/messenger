import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ActivationMailInput } from './dto/activation-mail.input'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  sendActivationMail(dto: ActivationMailInput) {
    this.mailerService.sendMail({
      to: dto.to,
      subject: `Подтвердите вашу учетную запись`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
          }
      
          .container {
            width: 80%;
            margin: auto;
            overflow: hidden;
          }
      
          .header {
            background: #50b3a2;
            color: white;
            padding: 10px 0;
            text-align: center;
          }
      
          .main-content {
            background-color: white;
            padding: 20px;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.12);
            margin: 20px 0;
          }
      
          .main-content p {
            line-height: 1.6;
            color: #333;
          }
      
          .button {
            display: inline-block;
            background: #50b3a2;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            margin: 10px 0;
            border-radius: 2px;
          }
      
          .footer {
            background: #50b3a2;
            color: white;
            text-align: center;
            padding: 10px 0;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Привет!</h1>
          </div>
          <div class="main-content">
            <p>Спасибо за регистрацию!</p>
            <p>Мы рады, что вы пользуетесь нашим мессенджером. Просто нажмите на кнопку ниже, чтобы подтвердить вашу регистрацию:</p>
            <a class="button" href="${dto.link}">Подтвердить регистрацию</a>
            <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Gerax Messenger. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    })
  }
}
