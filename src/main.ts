import { NestFactory } from '@nestjs/core';
import { AppModule } from '@zephyr/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import updater from '@zephyr/updater';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Zephyr')
    .setDescription('Zephyr API')
    .setVersion('0.0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser.default());
  app.enableCors();

  await app.listen(3828, () => {
    updater();
  });
}

bootstrap();
