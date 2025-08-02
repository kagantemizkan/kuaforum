# Hair Salon Ecosystem - Third-Party Integrations

## 🔗 Overview

This document outlines all third-party integrations required for the hair salon ecosystem, including AI services, payment processing, image storage, and communication services.

---

## 🤖 AI Service Integration

### Recommended: Replicate API

**Service**: [Replicate](https://replicate.com/) - AI model hosting platform
**Use Case**: Hair style suggestions from selfie uploads
**Cost**: Pay-per-use model (~$0.01-0.05 per inference)

#### Implementation Strategy

```typescript
// AI Service Configuration
interface AIServiceConfig {
  apiKey: string;
  endpoint: string;
  model: string;
  maxRetries: number;
  timeout: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

// AI Service Integration
class AIService {
  async generateStyleSuggestions(
    imageUrl: string,
    preferences: StylePreferences,
  ): Promise<StyleSuggestion[]> {
    const payload = {
      input: {
        image: imageUrl,
        hair_type: preferences.hairType,
        face_shape: preferences.faceShape,
        style_preferences: preferences.stylePreferences,
        num_suggestions: 5,
      },
    };

    const response = await this.replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      payload,
    );

    return this.processAIResponse(response);
  }
}
```

#### Alternative AI Services

1. **DeepAI** (Alternative)
   - **Pros**: Simple API, good documentation
   - **Cons**: Limited hair-specific models
   - **Cost**: $0.01-0.05 per image

2. **Custom Model Deployment**
   - **Pros**: Full control, optimized for hair styles
   - **Cons**: High development cost, maintenance overhead
   - **Cost**: $100-500/month hosting

#### AI Model Recommendations

```typescript
// Recommended Models for Hair Style Suggestions
const AI_MODELS = {
  // Primary: StyleGAN-based hair style generation
  PRIMARY:
    'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',

  // Fallback: General image-to-image transformation
  FALLBACK:
    'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',

  // Face detection and analysis
  FACE_ANALYSIS:
    'tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
};
```

#### Content Moderation

```typescript
// Content Moderation Service
class ContentModerationService {
  async validateImage(imageBuffer: Buffer): Promise<ValidationResult> {
    // NSFW detection
    const nsfwResult = await this.checkNSFW(imageBuffer);
    if (nsfwResult.isNSFW) {
      throw new Error('Inappropriate content detected');
    }

    // Face detection
    const faceResult = await this.detectFaces(imageBuffer);
    if (!faceResult.hasFace) {
      throw new Error('No face detected in image');
    }

    // Image quality check
    const qualityResult = await this.checkImageQuality(imageBuffer);
    if (qualityResult.quality < 0.7) {
      throw new Error('Image quality too low');
    }

    return {
      isValid: true,
      faceCount: faceResult.faceCount,
      quality: qualityResult.quality,
    };
  }
}
```

---

## 💳 RevenueCat Integration

### Subscription Management

**Service**: [RevenueCat](https://www.revenuecat.com/)
**Use Case**: Salon subscription tiers and billing
**Cost**: 1% of revenue (first $10k free)

#### Webhook Implementation

```typescript
// RevenueCat Webhook Handler
@Controller('payments')
export class PaymentsController {
  @Post('webhook/revenuecat')
  async handleRevenueCatWebhook(
    @Body() payload: RevenueCatWebhookDto,
    @Headers('authorization') signature: string,
  ) {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const event = payload.event;

    switch (event.type) {
      case 'INITIAL_PURCHASE':
        await this.handleInitialPurchase(event);
        break;
      case 'RENEWAL':
        await this.handleRenewal(event);
        break;
      case 'CANCELLATION':
        await this.handleCancellation(event);
        break;
      case 'UNCANCELLATION':
        await this.handleUncancellation(event);
        break;
      case 'NON_RENEWING_PURCHASE':
        await this.handleNonRenewingPurchase(event);
        break;
      case 'EXPIRATION':
        await this.handleExpiration(event);
        break;
      case 'BILLING_ISSUE':
        await this.handleBillingIssue(event);
        break;
      case 'PRODUCT_CHANGE':
        await this.handleProductChange(event);
        break;
    }

    return { success: true };
  }

  private async handleInitialPurchase(event: RevenueCatEvent) {
    const salonId = event.app_user_id;
    const productId = event.product_id;

    // Map product ID to subscription tier
    const subscriptionTier = this.mapProductToTier(productId);

    // Update salon subscription
    await this.salonService.updateSubscription(salonId, {
      tier: subscriptionTier,
      status: 'ACTIVE',
      currentPeriodStart: new Date(event.purchased_at_ms),
      currentPeriodEnd: new Date(event.expiration_at_ms),
      revenueCatCustomerId: event.app_user_id,
    });

    // Send welcome notification
    await this.notificationService.sendSubscriptionWelcome(
      salonId,
      subscriptionTier,
    );
  }
}
```

#### Subscription Tiers

```typescript
// Subscription Tier Configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: {
      maxStaff: 2,
      maxServices: 10,
      aiSuggestions: false,
      advancedAnalytics: false,
      customBranding: false,
      prioritySupport: false,
    },
    limits: {
      monthlyBookings: 50,
      monthlyCustomers: 25,
      storageGB: 1,
    },
  },
  BASIC: {
    name: 'Basic',
    price: 29.99,
    features: {
      maxStaff: 5,
      maxServices: 25,
      aiSuggestions: true,
      advancedAnalytics: false,
      customBranding: false,
      prioritySupport: false,
    },
    limits: {
      monthlyBookings: 200,
      monthlyCustomers: 100,
      storageGB: 5,
    },
  },
  PREMIUM: {
    name: 'Premium',
    price: 79.99,
    features: {
      maxStaff: 15,
      maxServices: 50,
      aiSuggestions: true,
      advancedAnalytics: true,
      customBranding: true,
      prioritySupport: false,
    },
    limits: {
      monthlyBookings: 1000,
      monthlyCustomers: 500,
      storageGB: 20,
    },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 199.99,
    features: {
      maxStaff: -1, // unlimited
      maxServices: -1, // unlimited
      aiSuggestions: true,
      advancedAnalytics: true,
      customBranding: true,
      prioritySupport: true,
    },
    limits: {
      monthlyBookings: -1, // unlimited
      monthlyCustomers: -1, // unlimited
      storageGB: 100,
    },
  },
};
```

#### Plan Enforcement Middleware

```typescript
// Subscription Plan Enforcement
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private salonService: SalonService,
    private subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const salonId = request.params.salonId || request.body.salonId;

    if (!salonId) {
      return true; // Allow if no salon context
    }

    const salon = await this.salonService.findById(salonId);
    const subscription =
      await this.subscriptionService.getSubscription(salonId);

    // Check if feature is available in current tier
    const requiredFeature = this.getRequiredFeature(request);
    if (requiredFeature && !subscription.features[requiredFeature]) {
      throw new ForbiddenException('Feature not available in current plan');
    }

    // Check usage limits
    const usage = await this.subscriptionService.getUsage(salonId);
    if (this.isLimitExceeded(subscription, usage)) {
      throw new ForbiddenException('Usage limit exceeded');
    }

    return true;
  }
}
```

---

## ☁️ Cloudinary Integration

### Image Storage & Processing

**Service**: [Cloudinary](https://cloudinary.com/)
**Use Case**: Image uploads, transformations, and CDN delivery
**Cost**: Free tier + pay-per-use for advanced features

#### Implementation

```typescript
// Cloudinary Service
@Injectable()
export class CloudinaryService {
  private cloudinary: v2.Cloudinary;

  constructor() {
    this.cloudinary = v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const uploadOptions = {
      folder: options.folder || 'hairsalon',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      ...options,
    };

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              publicId: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
            });
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async generateThumbnail(
    publicId: string,
    width: number,
    height: number,
  ): Promise<string> {
    return this.cloudinary.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' },
        { quality: 'auto:good' },
      ],
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
```

#### Image Validation

```typescript
// Image Validation Service
@Injectable()
export class ImageValidationService {
  async validateImage(file: Express.Multer.File): Promise<ValidationResult> {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size too large (max 10MB)');
    }

    // Check MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    // Validate image dimensions
    const dimensions = await this.getImageDimensions(file.buffer);
    if (dimensions.width < 200 || dimensions.height < 200) {
      throw new BadRequestException('Image too small (min 200x200)');
    }

    if (dimensions.width > 4000 || dimensions.height > 4000) {
      throw new BadRequestException('Image too large (max 4000x4000)');
    }

    return {
      isValid: true,
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: dimensions.width / dimensions.height,
    };
  }
}
```

---

## 📱 Push Notifications

### Expo Push Notifications

**Service**: [Expo](https://expo.dev/) - React Native push notifications
**Use Case**: Mobile app notifications
**Cost**: Free tier + pay-per-use

#### Implementation

```typescript
// Push Notification Service
@Injectable()
export class PushNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  async sendNotification(
    pushTokens: string[],
    notification: NotificationPayload,
  ): Promise<NotificationResult[]> {
    const messages = pushTokens
      .filter((token) => Expo.isExpoPushToken(token))
      .map((token) => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
        channelId: notification.channelId,
      }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notifications:', error);
      }
    }

    return tickets;
  }

  async sendBookingConfirmation(
    userId: string,
    booking: Booking,
  ): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user.pushToken) return;

    await this.sendNotification([user.pushToken], {
      title: 'Booking Confirmed',
      body: `Your appointment at ${booking.salon.name} has been confirmed`,
      data: {
        type: 'BOOKING_CONFIRMATION',
        bookingId: booking.id,
        salonId: booking.salonId,
      },
      channelId: 'bookings',
    });
  }

  async sendBookingReminder(userId: string, booking: Booking): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user.pushToken) return;

    await this.sendNotification([user.pushToken], {
      title: 'Appointment Reminder',
      body: `Don't forget your appointment tomorrow at ${booking.salon.name}`,
      data: {
        type: 'BOOKING_REMINDER',
        bookingId: booking.id,
        salonId: booking.salonId,
      },
      channelId: 'reminders',
    });
  }
}
```

---

## 📧 Email Notifications

### SendGrid Integration

**Service**: [SendGrid](https://sendgrid.com/)
**Use Case**: Email notifications and marketing
**Cost**: Free tier (100 emails/day) + pay-per-use

#### Implementation

```typescript
// Email Service
@Injectable()
export class EmailService {
  private sgMail: any;

  constructor() {
    this.sgMail = require('@sendgrid/mail');
    this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(
    to: string,
    templateId: string,
    dynamicTemplateData: any,
  ): Promise<void> {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId,
      dynamicTemplateData,
    };

    try {
      await this.sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    await this.sendEmail(user.email, 'd-welcome-template-id', {
      firstName: user.firstName,
      lastName: user.lastName,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
    });
  }

  async sendBookingConfirmation(user: User, booking: Booking): Promise<void> {
    await this.sendEmail(user.email, 'd-booking-confirmation-template-id', {
      firstName: user.firstName,
      salonName: booking.salon.name,
      serviceName: booking.service.name,
      appointmentDate: booking.appointmentDate,
      staffName: booking.staff?.name,
      totalPrice: booking.totalPrice,
      bookingUrl: `${process.env.FRONTEND_URL}/bookings/${booking.id}`,
    });
  }

  async sendPasswordReset(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await this.sendEmail(user.email, 'd-password-reset-template-id', {
      firstName: user.firstName,
      resetUrl,
      expiresIn: '1 hour',
    });
  }
}
```

---

## 📱 SMS Notifications

### Twilio Integration

**Service**: [Twilio](https://www.twilio.com/)
**Use Case**: SMS notifications and reminders
**Cost**: Pay-per-message (~$0.0075 per SMS)

#### Implementation

```typescript
// SMS Service
@Injectable()
export class SMSService {
  private twilio: any;

  constructor() {
    this.twilio = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async sendSMS(to: string, message: string, from?: string): Promise<void> {
    try {
      await this.twilio.messages.create({
        body: message,
        from: from || process.env.TWILIO_PHONE_NUMBER,
        to,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }

  async sendBookingReminder(user: User, booking: Booking): Promise<void> {
    if (!user.phone) return;

    const message = `Hi ${user.firstName}! Don't forget your appointment tomorrow at ${booking.salon.name} at ${booking.appointmentDate.toLocaleTimeString()}. Reply STOP to unsubscribe.`;

    await this.sendSMS(user.phone, message);
  }

  async sendVerificationCode(user: User, code: string): Promise<void> {
    if (!user.phone) return;

    const message = `Your verification code is: ${code}. Valid for 10 minutes. Reply STOP to unsubscribe.`;

    await this.sendSMS(user.phone, message);
  }
}
```

---

## 🔄 Queue System (BullMQ + Redis)

### Background Job Processing

**Service**: [BullMQ](https://docs.bullmq.io/) + [Redis](https://redis.io/)
**Use Case**: Background job processing for heavy tasks
**Cost**: Redis hosting (~$15-50/month)

#### Implementation

```typescript
// Queue Configuration
export const QUEUES = {
  IMAGE_PROCESSING: 'image-processing',
  AI_SUGGESTIONS: 'ai-suggestions',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  WEBHOOK_RETRY: 'webhook-retry',
} as const;

// Queue Service
@Injectable()
export class QueueService {
  private queues: Map<string, Queue> = new Map();

  constructor() {
    this.initializeQueues();
  }

  private async initializeQueues() {
    for (const [name, queueName] of Object.entries(QUEUES)) {
      const queue = new Queue(queueName, {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
        },
      });

      this.queues.set(name, queue);
    }
  }

  async addJob<T>(
    queueName: keyof typeof QUEUES,
    jobData: T,
    options?: JobOptions,
  ): Promise<Job<T>> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.add('default', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options,
    });
  }

  // AI Suggestions Job
  async processAISuggestions(
    imageUrl: string,
    preferences: StylePreferences,
  ): Promise<void> {
    await this.addJob(
      'AI_SUGGESTIONS',
      {
        imageUrl,
        preferences,
        timestamp: new Date(),
      },
      {
        priority: 5,
        delay: 0,
      },
    );
  }

  // Image Processing Job
  async processImage(
    imageBuffer: Buffer,
    options: ImageProcessingOptions,
  ): Promise<void> {
    await this.addJob('IMAGE_PROCESSING', {
      imageBuffer: imageBuffer.toString('base64'),
      options,
      timestamp: new Date(),
    });
  }

  // Notification Job
  async sendNotification(notification: NotificationPayload): Promise<void> {
    await this.addJob(
      'NOTIFICATIONS',
      {
        ...notification,
        timestamp: new Date(),
      },
      {
        priority: 10,
        delay: 0,
      },
    );
  }
}
```

#### Job Processors

```typescript
// AI Suggestions Processor
@Processor(QUEUES.AI_SUGGESTIONS)
export class AISuggestionsProcessor {
  constructor(
    private aiService: AIService,
    private styleSuggestionService: StyleSuggestionService,
  ) {}

  @Process()
  async processAISuggestions(job: Job<AISuggestionJobData>) {
    const { imageUrl, preferences, userId, salonId } = job.data;

    try {
      // Update status to processing
      await this.styleSuggestionService.updateStatus(job.id, 'PROCESSING');

      // Generate AI suggestions
      const suggestions = await this.aiService.generateStyleSuggestions(
        imageUrl,
        preferences,
      );

      // Save results
      await this.styleSuggestionService.saveResults(job.id, suggestions);

      // Update status to completed
      await this.styleSuggestionService.updateStatus(job.id, 'COMPLETED');
    } catch (error) {
      // Update status to failed
      await this.styleSuggestionService.updateStatus(job.id, 'FAILED');
      throw error;
    }
  }
}

// Notification Processor
@Processor(QUEUES.NOTIFICATIONS)
export class NotificationProcessor {
  constructor(
    private pushService: PushNotificationService,
    private emailService: EmailService,
    private smsService: SMSService,
  ) {}

  @Process()
  async processNotification(job: Job<NotificationJobData>) {
    const { type, userId, data } = job.data;

    const user = await this.userService.findById(userId);

    // Send push notification
    if (user.pushToken) {
      await this.pushService.sendNotification([user.pushToken], data);
    }

    // Send email notification
    if (user.email && user.notificationPreferences.email[type]) {
      await this.emailService.sendNotification(user, data);
    }

    // Send SMS notification
    if (user.phone && user.notificationPreferences.sms[type]) {
      await this.smsService.sendNotification(user, data);
    }
  }
}
```

---

## 📊 Analytics & Monitoring

### Application Performance Monitoring

**Service**: [Sentry](https://sentry.io/) or [DataDog](https://www.datadoghq.com/)
**Use Case**: Error tracking and performance monitoring
**Cost**: Free tier + pay-per-use

#### Implementation

```typescript
// Error Tracking Service
@Injectable()
export class ErrorTrackingService {
  constructor() {
    // Initialize Sentry
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
  }

  captureException(error: Error, context?: any): void {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  setUser(user: User): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
```

---

## 🔐 Security Services

### Rate Limiting

**Service**: Built-in with Redis
**Use Case**: API rate limiting and abuse prevention

#### Implementation

```typescript
// Rate Limiting Service
@Injectable()
export class RateLimitService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async checkRateLimit(
    key: string,
    limit: number,
    window: number,
  ): Promise<RateLimitResult> {
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, window);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = await this.redis.ttl(key);

    return {
      allowed: current <= limit,
      remaining,
      resetTime,
      limit,
    };
  }

  async checkUserRateLimit(
    userId: string,
    endpoint: string,
  ): Promise<RateLimitResult> {
    const key = `rate_limit:${userId}:${endpoint}`;

    // Different limits for different endpoints
    const limits = {
      'ai-suggestions': { limit: 10, window: 3600 }, // 10 per hour
      'qr-validation': { limit: 100, window: 3600 }, // 100 per hour
      'booking-create': { limit: 20, window: 3600 }, // 20 per hour
      default: { limit: 1000, window: 3600 }, // 1000 per hour
    };

    const config = limits[endpoint] || limits.default;
    return this.checkRateLimit(key, config.limit, config.window);
  }
}
```

---

## 📋 Integration Checklist

### Setup Requirements

- [ ] **AI Service**: Replicate API key and model configuration
- [ ] **RevenueCat**: API key and webhook endpoint setup
- [ ] **Cloudinary**: Cloud name, API key, and secret
- [ ] **Expo**: Access token for push notifications
- [ ] **SendGrid**: API key and email templates
- [ ] **Twilio**: Account SID, auth token, and phone number
- [ ] **Redis**: Host, port, and password for queue system
- [ ] **Sentry**: DSN for error tracking

### Environment Variables

```bash
# AI Services
REPLICATE_API_KEY=your_replicate_api_key
REPLICATE_MODEL_ID=your_model_id

# RevenueCat
REVENUECAT_API_KEY=your_revenuecat_api_key
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Push Notifications
EXPO_ACCESS_TOKEN=your_expo_access_token

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# SMS
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Error Tracking
SENTRY_DSN=your_sentry_dsn
```

### Testing Integrations

```typescript
// Integration Test Suite
describe('Third-Party Integrations', () => {
  describe('AI Service', () => {
    it('should generate style suggestions', async () => {
      const result = await aiService.generateStyleSuggestions(
        'test-image-url',
        testPreferences,
      );
      expect(result).toBeDefined();
      expect(result.suggestions).toHaveLength(5);
    });
  });

  describe('RevenueCat Webhook', () => {
    it('should handle subscription events', async () => {
      const webhook = createTestWebhook('INITIAL_PURCHASE');
      const result = await paymentsController.handleRevenueCatWebhook(webhook);
      expect(result.success).toBe(true);
    });
  });

  describe('Cloudinary', () => {
    it('should upload and process images', async () => {
      const file = createTestImageFile();
      const result = await cloudinaryService.uploadImage(file);
      expect(result.url).toBeDefined();
      expect(result.publicId).toBeDefined();
    });
  });
});
```

---

This comprehensive third-party integration guide ensures reliable, scalable, and secure operation of the hair salon ecosystem with proper error handling, monitoring, and fallback mechanisms.
