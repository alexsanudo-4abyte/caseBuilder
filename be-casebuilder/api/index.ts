import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Express } from 'express';

let cachedApp: Express | undefined;

async function bootstrap(): Promise<Express> {
  if (cachedApp) return cachedApp;

  const server = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn'] },
  );

  nestApp.setGlobalPrefix('api');

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5172'];

  nestApp.enableCors({ origin: allowedOrigins, credentials: true });

  await nestApp.init();
  cachedApp = server;
  return server;
}

export default async function handler(
  req: express.Request,
  res: express.Response,
) {
  const app = await bootstrap();
  app(req, res);
}
