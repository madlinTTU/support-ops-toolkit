import { ValidationPipe } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllExceptionsFilter } from './web/all-exceptions.filter.js'

export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.useGlobalFilters(new AllExceptionsFilter())

  const config = new DocumentBuilder()
    .setTitle('Support Ops Toolkit API')
    .setDescription('Tickets, statistics and knowledge-base candidates. All data is synthetic.')
    .setVersion('0.1')
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))
}
