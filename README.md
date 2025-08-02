# Hair Salon Ecosystem - Backend

A production-grade, multi-tenant hair salon ecosystem backend built with NestJS. This system supports React Native mobile apps for customers and React web dashboards for salon staff/owners.

## 🏗️ System Overview

This backend provides a complete solution for hair salon management with the following key features:

- **Multi-tenant Architecture**: Each salon operates in complete data isolation
- **AI-Powered Style Suggestions**: Generate hairstyle recommendations from selfies
- **QR Code System**: Easy salon joining and booking via QR codes
- **Subscription Management**: RevenueCat integration for salon tiers
- **Comprehensive Booking System**: Advanced scheduling with conflict detection
- **Loyalty Program**: Points-based reward system
- **Real-time Notifications**: Push, email, and SMS notifications
- **Analytics & Reporting**: Business intelligence for salon owners

## 📱 Applications

### Customer App (React Native)

- Salon discovery and comparison
- AI-powered style suggestions
- QR code scanning for salon joining
- Appointment booking and management
- Loyalty points and rewards

### Salon Dashboard (React Web)

- Staff and service management
- Booking calendar and scheduling
- Revenue analytics and reporting
- Subscription tier management
- Customer relationship management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/hair-salon-ecosystem.git
cd hair-salon-ecosystem

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run start:dev
```

### Environment Configuration

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hairsalon"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Third-party Services
REPLICATE_API_KEY="your-replicate-api-key"
REVENUECAT_API_KEY="your-revenuecat-api-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"

# Notifications
EXPO_ACCESS_TOKEN="your-expo-access-token"
SENDGRID_API_KEY="your-sendgrid-api-key"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
```

## 📚 Documentation

### Core Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - Complete system architecture and design
- **[Sprint Planning](SPRINT_PLAN.md)** - Development roadmap and user stories
- **[API Contracts](API_CONTRACTS.md)** - Complete API documentation and contracts
- **[Third-Party Integrations](THIRD_PARTY_INTEGRATIONS.md)** - External service integrations

### Development Guides

- [Database Schema](ARCHITECTURE.md#database-schema-prisma) - Prisma schema and models
- [Security Architecture](ARCHITECTURE.md#security-architecture) - Authentication and authorization
- [Testing Strategy](ARCHITECTURE.md#testing-strategy) - Unit, integration, and E2E testing
- [Deployment Guide](ARCHITECTURE.md#deployment-architecture) - Production deployment

## 🏗️ Architecture

### Module Structure

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

### Key Features

#### 🔐 Multi-Tenant Security

- Complete data isolation between salons
- Role-based access control (RBAC)
- Salon-scoped permissions and guards
- Secure JWT authentication with refresh tokens

#### 🤖 AI Integration

- Replicate API for hair style suggestions
- Image validation and content moderation
- Asynchronous processing with queue system
- Rate limiting and abuse prevention

#### 💳 Subscription Management

- RevenueCat integration for billing
- Tier-based feature access
- Usage tracking and limits
- Webhook handling for subscription events

#### 📱 QR Code System

- Secure QR code generation
- Usage tracking and analytics
- Expiration and usage limits
- Anti-tampering measures

#### 📊 Analytics Engine

- Real-time revenue tracking
- Customer insights and retention
- Staff performance metrics
- Business intelligence dashboards

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov

# Load testing
npm run test:load
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t hair-salon-backend .

# Run with Docker Compose
docker-compose up -d
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented
- [ ] Security audit completed

## 📈 Performance

### Benchmarks

- **API Response Time**: <200ms for 95% of requests
- **Database Query Time**: <50ms for simple queries
- **Image Upload Processing**: <5 seconds
- **AI Suggestion Generation**: <10 seconds

### Scaling Strategies

- Horizontal scaling with load balancers
- Database read replicas
- Redis caching for frequently accessed data
- CDN for static assets and images
- Queue-based background processing

## 🔐 Security

### Security Features

- JWT authentication with refresh token rotation
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting and abuse prevention
- SQL injection prevention with Prisma
- XSS and CSRF protection
- Secure file upload validation

### Compliance

- GDPR compliance for user data
- PCI compliance for payment data
- Data encryption at rest and in transit
- Regular security audits and penetration testing

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests
- Document all public APIs
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the comprehensive documentation above
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Email**: Contact support@hairsalonecosystem.com

### Community

- **Discord**: Join our [Discord server](https://discord.gg/hairsalonecosystem)
- **Twitter**: Follow [@HairSalonEco](https://twitter.com/HairSalonEco)
- **Blog**: Read our [technical blog](https://blog.hairsalonecosystem.com)

## 🏆 Acknowledgments

- **NestJS** - The amazing framework that powers this backend
- **Prisma** - Modern database toolkit
- **Replicate** - AI model hosting platform
- **RevenueCat** - Subscription management
- **Cloudinary** - Image storage and processing
- **Expo** - React Native push notifications

---

**Built with ❤️ for the hair salon industry**

This backend provides a solid foundation for building scalable, secure, and feature-rich hair salon management applications. The modular architecture ensures maintainability and extensibility as your business grows.
