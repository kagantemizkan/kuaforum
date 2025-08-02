# 💇‍♀️ Hair Salon Ecosystem - Backend API

A production-grade, multi-tenant hair salon ecosystem backend built with NestJS, featuring comprehensive API testing frontend, Docker containerization, and extensive third-party integrations.

## 🏗️ Architecture Overview

This is a complete backend system for managing hair salons with the following key features:

- **Multi-tenant Architecture**: Each salon operates with complete data isolation
- **Comprehensive API**: RESTful endpoints for all salon operations
- **Real-time Features**: WebSocket support for live updates
- **AI Integration**: Style suggestions using advanced AI models
- **Payment Processing**: RevenueCat integration for subscription management
- **Queue System**: Background job processing with BullMQ and Redis
- **Security First**: JWT authentication, RBAC, rate limiting, and input validation
- **Testing Interface**: Built-in React frontend for API testing and development

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd hair-salon-ecosystem-backend

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Start All Services

```bash
# Start all services (backend, frontend, database, Redis, etc.)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Access the Application

- **API Testing Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Database Admin (Adminer)**: http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **Health Check**: http://localhost:3000/health

## 📋 Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Backend API | 3000 | NestJS backend server |
| Frontend Tester | 3001 | React API testing interface |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching and queue system |
| Adminer | 8080 | Database management UI |
| Redis Commander | 8081 | Redis management UI |
| Nginx | 80/443 | Reverse proxy (production) |

## 🛠️ Development Setup (Without Docker)

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+

### 1. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

```bash
# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 3. Start Development Servers

```bash
# Start backend (terminal 1)
npm run start:dev

# Start frontend (terminal 2)
cd frontend
npm start
```

## 📚 API Documentation

### Authentication

All API endpoints (except public ones) require authentication via JWT tokens.

```bash
# Login example
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hairsalon.com", "password": "Admin123!"}'
```

### Core Endpoints

#### Authentication
- `POST /v1/auth/login` - User login
- `POST /v1/auth/register` - User registration  
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - User logout

#### Users
- `GET /v1/users/profile` - Get current user profile
- `PUT /v1/users/profile` - Update user profile
- `POST /v1/users/avatar` - Upload user avatar

#### Salons
- `GET /v1/salons` - List salons with filtering
- `GET /v1/salons/:id` - Get salon details
- `POST /v1/salons` - Create new salon
- `PUT /v1/salons/:id` - Update salon
- `DELETE /v1/salons/:id` - Delete salon

#### Bookings
- `GET /v1/bookings` - List user bookings
- `POST /v1/bookings` - Create new booking
- `GET /v1/bookings/:id` - Get booking details
- `PUT /v1/bookings/:id/cancel` - Cancel booking

#### AI Style Suggestions
- `POST /v1/ai/suggestions` - Upload image for AI analysis
- `GET /v1/ai/suggestions/:id` - Get AI suggestion results

#### QR Codes
- `POST /v1/qr/generate` - Generate QR code
- `POST /v1/qr/validate` - Validate QR code

### Complete API documentation is available at `/api-docs` when running the server.

## 🧪 Testing the API

### Using the Built-in Frontend

1. Start the application with Docker or development setup
2. Navigate to http://localhost:3001
3. Login with demo credentials:
   - Admin: `admin@hairsalon.com` / `Admin123!`
   - Salon Owner: `owner@salon.com` / `Owner123!`
   - Customer: `customer@example.com` / `Customer123!`
4. Test all API endpoints through the intuitive interface

### Using curl

```bash
# Get access token
TOKEN=$(curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hairsalon.com", "password": "Admin123!"}' \
  | jq -r '.data.tokens.accessToken')

# Use token for authenticated requests
curl -X GET http://localhost:3000/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# Third-party services
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
REPLICATE_API_KEY=your-replicate-key
REVENUECAT_API_KEY=your-revenuecat-key
```

### Feature Flags

Enable/disable features using environment variables:

```bash
FEATURE_AI_SUGGESTIONS=true
FEATURE_QR_CODES=true
FEATURE_PUSH_NOTIFICATIONS=true
FEATURE_SMS_NOTIFICATIONS=true
FEATURE_EMAIL_NOTIFICATIONS=true
```

## 🏢 Multi-Tenancy

The system supports complete multi-tenancy:

- **Data Isolation**: Each salon's data is completely isolated
- **Role-Based Access**: Different permission levels (Admin, Salon Owner, Staff, Customer)
- **Subscription Tiers**: Different feature sets based on subscription level
- **Salon Context**: All operations are scoped to the appropriate salon

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Refresh Tokens**: Long-lived refresh tokens for seamless UX
- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Comprehensive request validation
- **RBAC**: Role-based access control
- **Data Encryption**: Sensitive data encrypted at rest
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers and protections

## 📊 Monitoring & Observability

- **Health Checks**: Built-in health check endpoints
- **Structured Logging**: Comprehensive logging with Winston
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Metrics**: Request timing and performance tracking
- **Queue Monitoring**: BullMQ dashboard for job monitoring

## 🚀 Deployment

### Docker Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
# Build the application
npm run build

# Run database migrations
npx prisma migrate deploy

# Start production server
npm run start:prod
```

## 📈 Performance & Scaling

- **Horizontal Scaling**: Load balancer ready
- **Database Optimization**: Indexed queries and connection pooling
- **Caching**: Redis-based caching for frequently accessed data
- **Queue Processing**: Background job processing for heavy operations
- **CDN Integration**: Cloudinary for image optimization and delivery

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## 📝 API Testing Examples

### Create a Salon

```javascript
// Using the frontend testing interface
const salonData = {
  name: "Elegant Hair Studio",
  description: "Premium hair styling services",
  address: "123 Main Street",
  city: "New York",
  country: "USA",
  phone: "+1234567890",
  email: "info@elegant.com"
};

// POST /v1/salons
```

### Book an Appointment

```javascript
const bookingData = {
  salonId: "salon-uuid",
  serviceId: "service-uuid",
  appointmentDate: "2024-02-15T14:00:00Z",
  notes: "First time customer"
};

// POST /v1/bookings
```

### Upload Image for AI Suggestions

```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('preferences', JSON.stringify({
  hairType: "STRAIGHT",
  faceShape: "OVAL",
  stylePreferences: ["SHORT", "LAYERED"]
}));

// POST /v1/ai/suggestions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `/api-docs` for detailed API documentation
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with complete backend API
- Multi-tenant architecture
- AI integration for style suggestions
- Comprehensive API testing frontend
- Docker containerization
- Third-party service integrations
- Production-ready security and monitoring

---

**Built with ❤️ for the hair salon industry**
