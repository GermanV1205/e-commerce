import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; 
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <-- Importar Swagger

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // --- CONFIGURACIÓN DE SWAGGER (OPENAPI) ---
  const config = new DocumentBuilder()
    .setTitle('E-commerce API - Core Backend')
    .setDescription('Documentación interactiva y trazable del sistema de e-commerce. Soporta operaciones ACID y RBAC.')
    .setVersion('1.0')
    .addBearerAuth() // Habilita el botón "Authorize" para inyectar el JWT
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  // La documentación vivirá en la ruta /api/docs
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();