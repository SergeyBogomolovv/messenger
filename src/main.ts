import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import * as cors from 'cors'
import * as passport from 'passport'
import { HttpExceptionFilter } from 'lib/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new BadRequestException({
          message: errors[0].constraints[Object.keys(errors[0].constraints)[0]],
        })
      },
      stopAtFirstError: true,
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.use(cookieParser())
  const corsOptions = {
    origin: config.get('client_url'),
    credentials: true,
  }
  app.use(cors(corsOptions))
  app.use(passport.initialize())
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Messenger app')
    .setDescription('The messenger API description')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)
  await app.listen(config.get('port'))
}

bootstrap()
