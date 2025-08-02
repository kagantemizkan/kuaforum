# Hair Salon Ecosystem - Backend Architecture

## 🏗️ System Overview

This is a production-grade, multi-tenant hair salon ecosystem backend built with NestJS. The system supports React Native mobile apps for customers and React web dashboards for salon staff/owners.

### Core Applications

- **Customer App (React Native)**: Salon discovery, booking, AI style suggestions
- **Salon Dashboard (React Web)**: Staff management, analytics, subscription handling

## 🎯 Architecture Principles

- **Multi-tenancy**: Each salon operates in complete data isolation
- **Modular Design**: Feature-based modules with clear boundaries
- **Security First**: JWT auth, RBAC, input validation, rate limiting
- **Scalability**: Queue-based processing, horizontal scaling ready
- **Production Ready**: Comprehensive logging, monitoring, error handling

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/           # JWT, refresh tokens, OAuth
│   ├── users/          # Customer profiles, preferences
│   ├── salons/         # Multi-tenant salon management
│   ├── bookings/       # Appointment scheduling
│   ├── services/       # Salon services and pricing
│   ├── qr/            # QR code generation/validation
│   ├── ai/            # AI style suggestions
│   ├── payments/      # RevenueCat integration
│   ├── notifications/ # Push/email/SMS
│   ├── analytics/     # Revenue, metrics, reporting
│   └── admin/         # Super admin functions
├── common/            # Shared utilities, guards, decorators
├── config/           # Environment, database configs
└── database/         # Prisma schema, migrations
```

## 🗄️ Database Schema (Prisma)

### Core Models

```prisma
// User Management
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  phone       String?  @unique
  password    String
  firstName   String
  lastName    String
  avatar      String?
  role        UserRole @default(CUSTOMER)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  // Relations
  customerProfile CustomerProfile?
  salonMemberships SalonMember[]
  bookings        Booking[]
  reviews         Review[]
  loyaltyPoints   LoyaltyPoint[]
  refreshTokens   RefreshToken[]
}

// Multi-tenant Salon System
model Salon {
  id          String   @id @default(uuid())
  name        String
  description String?
  address     String
  city        String
  country     String
  phone       String
  email       String
  website     String?
  logo        String?
  banner      String?
  isActive    Boolean  @default(true)
  subscriptionTier SubscriptionTier @default(FREE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  // Relations
  members     SalonMember[]
  services    Service[]
  staff       Staff[]
  bookings    Booking[]
  reviews     Review[]
  qrCodes     QRCode[]
  analytics   Analytics[]
}

// Salon Membership (Multi-tenancy)
model SalonMember {
  id        String   @id @default(uuid())
  userId    String
  salonId   String
  role      SalonRole @default(CUSTOMER)
  joinedAt  DateTime @default(now())
  isActive  Boolean  @default(true)

  // Relations
  user      User     @relation(fields: [userId], references: [id])
  salon     Salon    @relation(fields: [salonId], references: [id])

  @@unique([userId, salonId])
}

// Services & Pricing
model Service {
  id          String   @id @default(uuid())
  salonId     String
  name        String
  description String?
  duration    Int      # minutes
  price       Decimal
  category    ServiceCategory
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  salon       Salon    @relation(fields: [salonId], references: [id])
  bookings    Booking[]
}

// Staff Management
model Staff {
  id          String   @id @default(uuid())
  salonId     String
  userId      String
  role        StaffRole
  specialties ServiceCategory[]
  schedule    Json     # Weekly schedule
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  salon       Salon    @relation(fields: [salonId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  bookings    Booking[]
}

// Booking System
model Booking {
  id             String        @id @default(uuid())
  salonId        String
  customerId     String
  serviceId      String
  staffId        String?
  appointmentDate DateTime
  duration       Int           # minutes
  status         BookingStatus @default(PENDING)
  notes          String?
  totalPrice     Decimal
  loyaltyPointsUsed Int        @default(0)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relations
  salon          Salon         @relation(fields: [salonId], references: [id])
  customer       User          @relation(fields: [customerId], references: [id])
  service        Service       @relation(fields: [serviceId], references: [id])
  staff          Staff?        @relation(fields: [staffId], references: [id])
  payments       Payment[]
}

// QR Code System
model QRCode {
  id          String   @id @default(uuid())
  salonId     String
  type        QRType
  code        String   @unique
  expiresAt   DateTime?
  maxUses     Int?
  usedCount   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  // Relations
  salon       Salon    @relation(fields: [salonId], references: [id])
}

// AI Style Suggestions
model StyleSuggestion {
  id          String   @id @default(uuid())
  userId      String
  salonId     String
  imageUrl    String
  aiResponse  Json
  status      AIStatus @default(PENDING)
  createdAt   DateTime @default(now())

  // Relations
  user        User     @relation(fields: [userId], references: [id])
  salon       Salon    @relation(fields: [salonId], references: [id])
}

// Payment & RevenueCat
model Payment {
  id          String   @id @default(uuid())
  bookingId   String
  amount      Decimal
  currency    String   @default("USD")
  status      PaymentStatus @default(PENDING)
  revenueCatTransactionId String?
  createdAt   DateTime @default(now())

  // Relations
  booking     Booking  @relation(fields: [bookingId], references: [id])
}

// Analytics & Reporting
model Analytics {
  id          String   @id @default(uuid())
  salonId     String
  date        DateTime
  revenue     Decimal
  bookings    Int
  customers   Int
  metrics     Json     # Additional KPIs
  createdAt   DateTime @default(now())

  // Relations
  salon       Salon    @relation(fields: [salonId], references: [id])
}

// Loyalty System
model LoyaltyPoint {
  id          String   @id @default(uuid())
  userId      String
  salonId     String
  points      Int
  type        LoyaltyType
  expiresAt   DateTime?
  createdAt   DateTime @default(now())

  // Relations
  user        User     @relation(fields: [userId], references: [id])
  salon       Salon    @relation(fields: [salonId], references: [id])
}

// Reviews & Ratings
model Review {
  id          String   @id @default(uuid())
  salonId     String
  customerId  String
  bookingId   String?
  rating      Int      @db.SmallInt
  comment     String?
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())

  // Relations
  salon       Salon    @relation(fields: [salonId], references: [id])
  customer    User     @relation(fields: [customerId], references: [id])
}

// Refresh Tokens
model RefreshToken {
  id          String   @id @default(uuid())
  userId      String
  token       String   @unique
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  // Relations
  user        User     @relation(fields: [userId], references: [id])
}

// Customer Profiles
model CustomerProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  preferences Json?    # Hair preferences, allergies, etc.
  loyaltyTier LoyaltyTier @default(BRONZE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id])
}
```

### Enums

```prisma
enum UserRole {
  CUSTOMER
  SALON_OWNER
  STAFF
  ADMIN
}

enum SalonRole {
  CUSTOMER
  STAFF
  OWNER
}

enum StaffRole {
  STYLIST
  ASSISTANT
  MANAGER
  OWNER
}

enum ServiceCategory {
  HAIRCUT
  COLORING
  STYLING
  TREATMENT
  EXTENSIONS
  CONSULTATION
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum SubscriptionTier {
  FREE
  BASIC
  PREMIUM
  ENTERPRISE
}

enum QRType {
  SALON_JOIN
  BOOKING
  LOYALTY
}

enum AIStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum LoyaltyType {
  EARNED
  REDEEMED
  BONUS
  EXPIRED
}

enum LoyaltyTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}
```

## 🔐 Security Architecture

### Authentication Flow

1. **JWT with Refresh Tokens**: Short-lived access tokens (15min) + long-lived refresh tokens (7 days)
2. **Multi-factor Authentication**: Optional SMS/email verification
3. **OAuth Integration**: Apple/Google sign-in for mobile apps
4. **Rate Limiting**: Per-endpoint and per-user limits
5. **Input Validation**: Class-validator with custom decorators

### Authorization (RBAC)

```typescript
// Role hierarchy
ADMIN > SALON_OWNER > STAFF > CUSTOMER

// Salon-scoped permissions
@SalonScoped()
@RequireRole([SalonRole.OWNER, SalonRole.STAFF])
async getSalonAnalytics(@SalonId() salonId: string) {
  // Only access own salon data
}
```

### Data Isolation

- **Multi-tenancy**: All salon data filtered by `salonId`
- **Middleware**: Automatic salon context injection
- **Guards**: Prevent cross-salon data access
- **Encryption**: Sensitive data encrypted at rest

## 🚀 Third-Party Integrations

### RevenueCat Integration

```typescript
// Webhook handler for subscription events
@Post('webhook/revenuecat')
async handleRevenueCatWebhook(@Body() payload: RevenueCatWebhookDto) {
  // Update salon subscription status
  // Enforce plan limits
  // Handle billing events
}
```

### AI Service Integration

**Recommended: Replicate API** for hair style suggestions

- **Model**: StyleGAN or similar for hair style generation
- **Image Processing**: Face detection, hair segmentation
- **Rate Limiting**: Per-user limits to prevent abuse
- **Content Moderation**: NSFW detection before AI processing

### QR Code System

- **Generation**: UUID-based with salon prefix
- **Validation**: Server-side verification
- **Expiration**: Time-based and usage-based limits
- **Security**: Anti-tampering measures

## 📊 API Design

### RESTful Endpoints Structure

```
/api/v1/
├── auth/
│   ├── login
│   ├── register
│   ├── refresh
│   └── logout
├── salons/
│   ├── /:id
│   ├── /:id/services
│   ├── /:id/staff
│   └── /:id/analytics
├── bookings/
│   ├── /
│   ├── /:id
│   └── /:id/cancel
├── ai/
│   ├── /suggestions
│   └── /upload
├── qr/
│   ├── /generate
│   └── /validate
└── admin/
    ├── /salons
    ├── /users
    └── /analytics
```

### Request/Response DTOs

```typescript
// Example: Create Booking
export class CreateBookingDto {
  @IsUUID()
  salonId: string;

  @IsUUID()
  serviceId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsDateString()
  appointmentDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  loyaltyPointsUsed?: number;
}

export class BookingResponseDto {
  id: string;
  salonId: string;
  customerId: string;
  serviceId: string;
  staffId?: string;
  appointmentDate: Date;
  status: BookingStatus;
  totalPrice: number;
  loyaltyPointsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔄 Queue System (BullMQ)

### Queue Configuration

```typescript
// Queue definitions
export const QUEUES = {
  IMAGE_PROCESSING: 'image-processing',
  AI_SUGGESTIONS: 'ai-suggestions',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  WEBHOOK_RETRY: 'webhook-retry',
} as const;
```

### Job Types

1. **Image Processing**: Upload to Cloudinary, generate thumbnails
2. **AI Suggestions**: Process selfies, call external AI API
3. **Notifications**: Send push/email/SMS notifications
4. **Analytics**: Generate daily/weekly reports
5. **Webhook Retry**: Retry failed RevenueCat webhooks

## 📱 Mobile App Contracts

### Customer App API Contracts

```typescript
// Salon Discovery
interface SalonSearchResponse {
  salons: Array<{
    id: string;
    name: string;
    address: string;
    rating: number;
    reviewCount: number;
    services: Array<{
      id: string;
      name: string;
      price: number;
      duration: number;
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// AI Style Suggestion
interface StyleSuggestionRequest {
  image: File;
  preferences?: {
    hairType: string;
    faceShape: string;
    stylePreferences: string[];
  };
}

interface StyleSuggestionResponse {
  id: string;
  suggestions: Array<{
    style: string;
    confidence: number;
    imageUrl: string;
    description: string;
  }>;
  processingTime: number;
}
```

## 🖥️ Web Dashboard Contracts

### Salon Dashboard API Contracts

```typescript
// Analytics Response
interface SalonAnalyticsResponse {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: number; // percentage change
  };
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    returning: number;
  };
  services: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
}

// Staff Schedule
interface StaffScheduleResponse {
  staffId: string;
  name: string;
  schedule: {
    [day: string]: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  };
  bookings: Array<{
    id: string;
    customerName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
  }>;
}
```

## 🧪 Testing Strategy

### Test Pyramid

1. **Unit Tests** (70%): Service methods, utilities, guards
2. **Integration Tests** (20%): API endpoints, database operations
3. **E2E Tests** (10%): Complete user journeys

### Test Coverage Goals

- **Overall Coverage**: >80%
- **Critical Paths**: >95%
- **Security Functions**: 100%

### Testing Tools

- **Jest**: Unit and integration testing
- **Supertest**: API endpoint testing
- **Testcontainers**: Database testing
- **Mock**: External service mocking

## 📈 Performance & Scalability

### Performance Benchmarks

- **API Response Time**: <200ms for 95% of requests
- **Database Query Time**: <50ms for simple queries
- **Image Upload Processing**: <5 seconds
- **AI Suggestion Generation**: <10 seconds

### Scaling Strategies

1. **Horizontal Scaling**: Load balancer + multiple instances
2. **Database Scaling**: Read replicas, connection pooling
3. **Caching**: Redis for sessions, frequently accessed data
4. **CDN**: Static assets, images
5. **Queue Processing**: Background job workers

### Monitoring & Observability

- **Application Metrics**: Response times, error rates
- **Business Metrics**: Bookings, revenue, user growth
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Custom Dashboards**: Salon performance, system health

## 🚀 Deployment Architecture

### Environment Configuration

```typescript
// Environment variables
export interface AppConfig {
  port: number;
  database: {
    url: string;
    ssl: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  ai: {
    apiKey: string;
    endpoint: string;
  };
  revenueCat: {
    apiKey: string;
    webhookSecret: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  redis: {
    url: string;
  };
}
```

### Docker Configuration

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

## 🔧 Development Workflow

### Git Strategy

- **Main Branch**: Production-ready code
- **Feature Branches**: Feature development
- **Release Branches**: Version releases
- **Hotfix Branches**: Critical bug fixes

### CI/CD Pipeline

1. **Code Quality**: ESLint, Prettier, TypeScript checks
2. **Testing**: Unit, integration, E2E tests
3. **Security**: Dependency scanning, SAST
4. **Build**: Docker image creation
5. **Deploy**: Blue-green deployment

### Code Review Checklist

- [ ] Security vulnerabilities
- [ ] Performance implications
- [ ] Error handling
- [ ] Test coverage
- [ ] Documentation updates
- [ ] Multi-tenant considerations

## 📚 Documentation Standards

### API Documentation

- **Swagger/OpenAPI**: Auto-generated from decorators
- **Postman Collection**: Importable API collection
- **Examples**: Request/response examples
- **Error Codes**: Comprehensive error documentation

### Code Documentation

- **JSDoc**: Public methods and classes
- **README**: Module-specific documentation
- **Architecture Decision Records (ADRs)**: Design decisions
- **Deployment Guides**: Environment setup

## 🛡️ Security Checklist

### Authentication & Authorization

- [ ] JWT token validation
- [ ] Refresh token rotation
- [ ] Role-based access control
- [ ] Salon-scoped permissions
- [ ] Rate limiting implementation

### Data Protection

- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Data encryption at rest

### File Upload Security

- [ ] MIME type validation
- [ ] File size limits
- [ ] Malicious content scanning
- [ ] Secure file storage
- [ ] Signed URL generation

### API Security

- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Request size limits
- [ ] Error message sanitization
- [ ] Audit logging

## 🎯 Success Metrics

### Technical Metrics

- **Uptime**: 99.9% availability
- **Response Time**: <200ms average
- **Error Rate**: <0.1% of requests
- **Test Coverage**: >80%

### Business Metrics

- **User Growth**: Monthly active users
- **Booking Conversion**: Browse to book ratio
- **Customer Retention**: Repeat booking rate
- **Revenue Growth**: Monthly recurring revenue

### Security Metrics

- **Security Incidents**: Zero critical vulnerabilities
- **Compliance**: GDPR, PCI compliance
- **Audit Results**: Annual security audits
- **Penetration Testing**: Quarterly security assessments

---

This architecture provides a solid foundation for a production-grade hair salon ecosystem that can scale with your business needs while maintaining security, performance, and maintainability.
