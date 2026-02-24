import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get app configuration
  const configService = app.get(ConfigService);
  const appPort = configService.get('app.port') as number || 3000;
  const appName = configService.get('app.name') as string || 'Kios BE';

  // Enable CORS
  app.enableCors({
    origin: (configService.get('CORS_ORIGIN') as string) || '*',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription('API Documentation for Kios Backend')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Please enter your JWT token here',
    })
    .addServer(`http://localhost:${appPort}`, 'Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(appPort);
  console.log(`🚀 ${appName} is running on http://localhost:${appPort}`);
  console.log(
    `📚 API Documentation: http://localhost:${appPort}/api/docs`,
  );
}

bootstrap();
