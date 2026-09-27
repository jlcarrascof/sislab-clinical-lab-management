import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: [config.get<string>('FRONTEND_URL', 'http://localhost:5173')],
    credentials: true,
  });

  // Equivalente a $request->validate() de Laravel, aplicado a todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = Number(config.get('PORT', 3000));
  await app.listen(port);
  console.log(`SisLab API corriendo en http://localhost:${port}`);
}
void bootstrap();
