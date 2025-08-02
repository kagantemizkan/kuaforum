import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Database
import { PrismaModule } from './database/prisma.module';

// Core modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SalonsModule } from './modules/salons/salons.module';
import { ServicesModule } from './modules/services/services.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { QrModule } from './modules/qr/qr.module';
import { AiModule } from './modules/ai/ai.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';

// Common modules
import { CommonModule } from './common/common.module';

// Configuration
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { cloudinaryConfig } from './config/cloudinary.config';

// Legacy controllers (to be removed)
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        cloudinaryConfig,
      ],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('THROTTLE_TTL') || 60, // 1 minute
        limit: configService.get('THROTTLE_LIMIT') || 100, // 100 requests per minute
      }),
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Queue system with Redis
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB') || 0,
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),

    // Static file serving
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Database
    PrismaModule,

    // Common utilities
    CommonModule,

    // Feature modules
    AuthModule,
    UsersModule,
    SalonsModule,
    ServicesModule,
    BookingsModule,
    QrModule,
    AiModule,
    PaymentsModule,
    AnalyticsModule,
    NotificationsModule,
    ReviewsModule,
    AdminModule,
  ],
  controllers: [AppController], // Legacy controller
  providers: [AppService], // Legacy service
})
export class AppModule {
  constructor(private configService: ConfigService) {
    // Log important configuration on startup
    const nodeEnv = this.configService.get('NODE_ENV');
    const port = this.configService.get('PORT');
    const dbUrl = this.configService.get('DATABASE_URL');
    
    console.log(`🔧 Environment: ${nodeEnv}`);
    console.log(`🔧 Port: ${port}`);
    console.log(`🔧 Database: ${dbUrl ? 'Connected' : 'Not configured'}`);
    
    // Warn about missing environment variables in development
    if (nodeEnv === 'development') {
      this.checkRequiredEnvVars();
    }
  }

  private checkRequiredEnvVars() {
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
    ];

    const missingVars = requiredVars.filter(
      (varName) => !this.configService.get(varName),
    );

    if (missingVars.length > 0) {
      console.warn(
        `⚠️  Missing environment variables: ${missingVars.join(', ')}`,
      );
      console.warn('⚠️  Some features may not work correctly');
    }

    // Optional but recommended variables
    const optionalVars = [
      'CLOUDINARY_CLOUD_NAME',
      'SENDGRID_API_KEY',
      'TWILIO_ACCOUNT_SID',
      'REPLICATE_API_KEY',
      'REVENUECAT_API_KEY',
    ];

    const missingOptionalVars = optionalVars.filter(
      (varName) => !this.configService.get(varName),
    );

    if (missingOptionalVars.length > 0) {
      console.info(
        `💡 Optional environment variables not set: ${missingOptionalVars.join(', ')}`,
      );
      console.info('💡 Related features will be disabled');
    }
  }
}
