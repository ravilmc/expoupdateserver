import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationException } from './validation/validation.exception';
import { ValidationFilter } from './validation/validation.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        throw new ValidationException(errors);
      },
    }),
  );

  app.enableCors({
    origin: '*',
  });

  app.use((req, res, next) => {
    console.log(req.url);
    next();
  });
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || '3000';
  await app.listen(port);
}
bootstrap();
