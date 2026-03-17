import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';

function validateEnv() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey)
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  if (encryptionKey.length !== 64)
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');

  const isProduction = process.env.NODE_ENV === 'production';
  if (
    isProduction &&
    (secret === 'casebuilder-jwt-secret-dev' || secret === 'dev-secret')
  ) {
    throw new Error(
      'JWT_SECRET is still set to a development value — set a strong secret in production',
    );
  }
}

async function bootstrap() {
  validateEnv();

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:4173'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
