import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../dist/app.module';

let cachedApp: express.Express;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    try {
      const expressApp = express();
      const adapter = new ExpressAdapter(expressApp);

      const app = await NestFactory.create(AppModule, adapter, {
        logger: console,
      });
      const app = await NestFactory.create(AppModule, adapter, {
        logger: console,
      });

      // Enable CORS
      app.enableCors({
        origin: [
          'https://commit-pt.vercel.app',
          'http://localhost:5173',
          'http://localhost:3000',
        ],
        credentials: true,
      });

      // Enable validation
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      // Enable validation
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

      await app.init();
      cachedApp = expressApp;
      await app.init();
      cachedApp = expressApp;

      return expressApp;
    } catch (error) {
      console.error('Error creating NestJS app:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating NestJS app:', error);
    throw error;
  }
}

export default async function handler(
  req: express.Request,
  res: express.Response,
): Promise<void> {
  try {
    const app = await createApp();
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  try {
    const app = await createApp();
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
