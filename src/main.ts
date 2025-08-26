import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 8080;

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));

  app.useStaticAssets(join(__dirname, '..','..', 'public'), {
    prefix: '/public/', // akses via http://localhost:3000/public/namafile.jpg
  });

  app.enableCors();

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 App running on http://localhost:${port}`);
}
bootstrap();

