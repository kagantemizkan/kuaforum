import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;
  const nodeEnv = configService.get('NODE_ENV') || 'development';

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginEmbedderPolicy: false,
  }));

  // Compression middleware
  app.use(compression());

  // Cookie parser
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3001', // Frontend development
      'http://localhost:3000', // Alternative frontend port
      'http://frontend:3000',  // Docker frontend service
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-Time',
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API versioning
  app.setGlobalPrefix('v1');

  // Swagger documentation setup
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Hair Salon Ecosystem API')
      .setDescription('Production-grade multi-tenant hair salon ecosystem backend API')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          description: 'JWT Authorization',
          name: 'Authorization',
          bearerFormat: 'Bearer',
          scheme: 'Bearer',
          type: 'http',
          in: 'Header',
        },
        'access-token',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User management and profiles')
      .addTag('Salons', 'Salon management and multi-tenancy')
      .addTag('Services', 'Salon services and pricing')
      .addTag('Bookings', 'Appointment booking system')
      .addTag('QR Codes', 'QR code generation and validation')
      .addTag('AI', 'AI-powered style suggestions')
      .addTag('Payments', 'Payment processing and subscriptions')
      .addTag('Analytics', 'Business analytics and reporting')
      .addTag('Notifications', 'Multi-channel notifications')
      .addTag('Reviews', 'Customer reviews and ratings')
      .addTag('Admin', 'Administrative functions')
      .addServer(`http://localhost:${port}`, 'Development server')
      .addServer('https://api.hairsalonecosystem.com', 'Production server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showRequestHeaders: true,
      },
      customSiteTitle: 'Hair Salon API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      ],
    });

    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api-docs`);
  }

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  await app.listen(port);

  logger.log(`🚀 Hair Salon Ecosystem API running on: http://localhost:${port}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`📊 Health check: http://localhost:${port}/health`);
  
  if (nodeEnv !== 'production') {
    logger.log(`📖 API Documentation: http://localhost:${port}/api-docs`);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
