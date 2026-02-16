import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Enable CORS — allow exact origins and their subdomains
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (origin === allowed) return true;
        // Extract hostname+port from allowed origin to match subdomains
        const { hostname, port, protocol } = new URL(allowed);
        const subdomainRegex = new RegExp(
          `^${protocol}//[^.]+\\.${hostname.replace('.', '\\.')}${port ? `:${port}` : ''}$`,
        );
        return subdomainRegex.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // convierte query strings a sus tipos (número, etc.)
      whitelist: true, // elimina propiedades no decoradas
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
