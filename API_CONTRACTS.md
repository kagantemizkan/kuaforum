# Hair Salon Ecosystem - API Contracts

## 📋 Overview

This document defines the complete API contracts for the hair salon ecosystem backend. All endpoints follow RESTful principles and include proper authentication, validation, and error handling.

## 🔐 Authentication

### Base URL

```
Production: https://api.hairsalonecosystem.com/v1
Development: http://localhost:3000/v1
```

### Authentication Headers

```typescript
// All authenticated requests require:
Authorization: Bearer<access_token>;

// For refresh token requests:
Authorization: Bearer<refresh_token>;
```

### Common Response Headers

```typescript
{
  "Content-Type": "application/json",
  "X-Request-ID": "uuid-v4",
  "X-Rate-Limit-Remaining": "99",
  "X-Rate-Limit-Reset": "1640995200"
}
```

---

## 👤 Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```typescript
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER" // CUSTOMER, SALON_OWNER, STAFF, ADMIN
}
```

**Response (201):**

```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 900 // 15 minutes
    }
  }
}
```

### POST /auth/login

Authenticate user and receive tokens.

**Request Body:**

```typescript
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "isActive": true
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 900
    }
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**

```typescript
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 900
  }
}
```

### POST /auth/logout

Logout user and invalidate tokens.

**Response (200):**

```typescript
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## 🏪 Salon Endpoints

### GET /salons

Get list of salons with filtering and pagination.

**Query Parameters:**

```typescript
{
  "page": 1,
  "limit": 20,
  "search": "hair salon",
  "city": "New York",
  "category": "HAIRCUT",
  "rating": 4.5,
  "sortBy": "rating", // rating, distance, name
  "sortOrder": "desc" // asc, desc
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "salons": [
      {
        "id": "uuid",
        "name": "Elegant Hair Salon",
        "description": "Premium hair styling services",
        "address": "123 Main St",
        "city": "New York",
        "country": "USA",
        "phone": "+1234567890",
        "email": "info@elegant.com",
        "website": "https://elegant.com",
        "logo": "https://cloudinary.com/logo.jpg",
        "banner": "https://cloudinary.com/banner.jpg",
        "rating": 4.8,
        "reviewCount": 156,
        "subscriptionTier": "PREMIUM",
        "isActive": true,
        "services": [
          {
            "id": "uuid",
            "name": "Haircut & Style",
            "price": 75.00,
            "duration": 60,
            "category": "HAIRCUT"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### GET /salons/:id

Get detailed salon information.

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Elegant Hair Salon",
    "description": "Premium hair styling services",
    "address": "123 Main St",
    "city": "New York",
    "country": "USA",
    "phone": "+1234567890",
    "email": "info@elegant.com",
    "website": "https://elegant.com",
    "logo": "https://cloudinary.com/logo.jpg",
    "banner": "https://cloudinary.com/banner.jpg",
    "rating": 4.8,
    "reviewCount": 156,
    "subscriptionTier": "PREMIUM",
    "isActive": true,
    "businessHours": {
      "monday": { "open": "09:00", "close": "18:00" },
      "tuesday": { "open": "09:00", "close": "18:00" },
      "wednesday": { "open": "09:00", "close": "18:00" },
      "thursday": { "open": "09:00", "close": "18:00" },
      "friday": { "open": "09:00", "close": "18:00" },
      "saturday": { "open": "10:00", "close": "16:00" },
      "sunday": { "open": null, "close": null }
    },
    "services": [...],
    "staff": [...],
    "reviews": [...]
  }
}
```

### POST /salons

Create a new salon (Salon Owner only).

**Request Body:**

```typescript
{
  "name": "Elegant Hair Salon",
  "description": "Premium hair styling services",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "phone": "+1234567890",
  "email": "info@elegant.com",
  "website": "https://elegant.com",
  "businessHours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" },
    "wednesday": { "open": "09:00", "close": "18:00" },
    "thursday": { "open": "09:00", "close": "18:00" },
    "friday": { "open": "09:00", "close": "18:00" },
    "saturday": { "open": "10:00", "close": "16:00" },
    "sunday": { "open": null, "close": null }
  }
}
```

### PUT /salons/:id

Update salon information (Salon Owner only).

### DELETE /salons/:id

Deactivate salon (Salon Owner only).

---

## 📅 Booking Endpoints

### GET /bookings

Get user's bookings with filtering.

**Query Parameters:**

```typescript
{
  "page": 1,
  "limit": 20,
  "status": "CONFIRMED", // PENDING, CONFIRMED, COMPLETED, CANCELLED
  "salonId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "salonId": "uuid",
        "salonName": "Elegant Hair Salon",
        "serviceId": "uuid",
        "serviceName": "Haircut & Style",
        "staffId": "uuid",
        "staffName": "Jane Smith",
        "appointmentDate": "2024-01-15T14:00:00Z",
        "duration": 60,
        "status": "CONFIRMED",
        "totalPrice": 75.00,
        "loyaltyPointsUsed": 0,
        "notes": "Please bring reference photos",
        "createdAt": "2024-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### POST /bookings

Create a new booking.

**Request Body:**

```typescript
{
  "salonId": "uuid",
  "serviceId": "uuid",
  "staffId": "uuid", // optional
  "appointmentDate": "2024-01-15T14:00:00Z",
  "notes": "Please bring reference photos",
  "loyaltyPointsUsed": 0
}
```

**Response (201):**

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "salonId": "uuid",
    "serviceId": "uuid",
    "staffId": "uuid",
    "appointmentDate": "2024-01-15T14:00:00Z",
    "duration": 60,
    "status": "PENDING",
    "totalPrice": 75.00,
    "loyaltyPointsUsed": 0,
    "notes": "Please bring reference photos",
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

### GET /bookings/:id

Get booking details.

### PUT /bookings/:id/cancel

Cancel a booking.

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-10T11:00:00Z"
  }
}
```

### GET /salons/:id/availability

Get available time slots for a salon.

**Query Parameters:**

```typescript
{
  "date": "2024-01-15",
  "serviceId": "uuid",
  "staffId": "uuid" // optional
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "10:00",
        "staffId": "uuid",
        "staffName": "Jane Smith"
      },
      {
        "startTime": "10:00",
        "endTime": "11:00",
        "staffId": "uuid",
        "staffName": "Jane Smith"
      }
    ]
  }
}
```

---

## 🎨 AI Style Suggestions

### POST /ai/suggestions

Upload selfie and get AI style suggestions.

**Request Body (multipart/form-data):**

```typescript
{
  "image": File, // selfie image
  "preferences": {
    "hairType": "STRAIGHT", // STRAIGHT, WAVY, CURLY, COILY
    "faceShape": "OVAL", // OVAL, ROUND, SQUARE, HEART, DIAMOND
    "stylePreferences": ["SHORT", "LAYERED", "BANGS"],
    "colorPreferences": ["NATURAL", "HIGHLIGHTS", "BALAYAGE"]
  }
}
```

**Response (202):**

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PROCESSING",
    "estimatedTime": 30 // seconds
  }
}
```

### GET /ai/suggestions/:id

Get AI suggestion results.

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "imageUrl": "https://cloudinary.com/selfie.jpg",
    "suggestions": [
      {
        "style": "Layered Bob",
        "confidence": 0.95,
        "imageUrl": "https://cloudinary.com/suggestion1.jpg",
        "description": "A modern layered bob that frames your face beautifully",
        "difficulty": "MEDIUM",
        "maintenance": "LOW",
        "priceRange": {
          "min": 60,
          "max": 120
        }
      },
      {
        "style": "Side Swept Bangs",
        "confidence": 0.87,
        "imageUrl": "https://cloudinary.com/suggestion2.jpg",
        "description": "Elegant side swept bangs that add movement",
        "difficulty": "EASY",
        "maintenance": "MEDIUM",
        "priceRange": {
          "min": 40,
          "max": 80
        }
      }
    ],
    "processingTime": 25,
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

---

## 📱 QR Code Endpoints

### POST /qr/generate

Generate QR code for salon (Salon Owner only).

**Request Body:**

```typescript
{
  "salonId": "uuid",
  "type": "SALON_JOIN", // SALON_JOIN, BOOKING, LOYALTY
  "expiresAt": "2024-12-31T23:59:59Z", // optional
  "maxUses": 100 // optional
}
```

**Response (201):**

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "SALON_ABC123XYZ",
    "qrCodeUrl": "https://cloudinary.com/qr-code.png",
    "type": "SALON_JOIN",
    "expiresAt": "2024-12-31T23:59:59Z",
    "maxUses": 100,
    "usedCount": 0,
    "isActive": true
  }
}
```

### POST /qr/validate

Validate and process QR code scan.

**Request Body:**

```typescript
{
  "code": "SALON_ABC123XYZ"
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "valid": true,
    "type": "SALON_JOIN",
    "salonId": "uuid",
    "salonName": "Elegant Hair Salon",
    "action": "JOIN_SALON",
    "message": "Successfully joined Elegant Hair Salon"
  }
}
```

---

## 💳 Payment & RevenueCat

### POST /payments/webhook/revenuecat

RevenueCat webhook endpoint.

**Request Body:**

```typescript
{
  "api_version": "1.0",
  "event": {
    "type": "INITIAL_PURCHASE",
    "id": "uuid",
    "app_user_id": "uuid",
    "aliases": ["user@example.com"],
    "original_app_user_id": "uuid",
    "product_id": "salon_premium_monthly",
    "period_type": "normal",
    "purchased_at_ms": 1640995200000,
    "expiration_at_ms": 1643587200000,
    "environment": "PRODUCTION",
    "entitlement_id": "premium_features",
    "entitlement_ids": ["premium_features"],
    "transaction_id": "uuid",
    "original_transaction_id": "uuid",
    "is_family_share": false,
    "country_code": "US",
    "app_id": "app_id",
    "offer_code": null,
    "currency": "USD",
    "price": 29.99,
    "subscriber_attributes": {}
  }
}
```

### GET /payments/subscription/:salonId

Get salon subscription status.

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "salonId": "uuid",
    "subscriptionTier": "PREMIUM",
    "status": "ACTIVE",
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "features": {
      "maxStaff": 10,
      "maxServices": 50,
      "aiSuggestions": true,
      "advancedAnalytics": true,
      "customBranding": true
    },
    "usage": {
      "staffCount": 5,
      "serviceCount": 25,
      "aiRequestsThisMonth": 150
    }
  }
}
```

---

## 📊 Analytics Endpoints

### GET /analytics/salon/:id

Get salon analytics (Salon Owner only).

**Query Parameters:**

```typescript
{
  "period": "month", // day, week, month, year
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "period": "month",
    "revenue": {
      "total": 12500.00,
      "daily": 416.67,
      "trend": 15.5, // percentage change
      "breakdown": {
        "HAIRCUT": 6000.00,
        "COLORING": 4500.00,
        "STYLING": 2000.00
      }
    },
    "bookings": {
      "total": 167,
      "completed": 150,
      "cancelled": 12,
      "noShows": 5,
      "conversionRate": 89.8
    },
    "customers": {
      "total": 89,
      "new": 23,
      "returning": 66,
      "retentionRate": 74.2
    },
    "services": [
      {
        "id": "uuid",
        "name": "Haircut & Style",
        "bookings": 45,
        "revenue": 3375.00,
        "averageRating": 4.8
      }
    ],
    "staff": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "bookings": 67,
        "revenue": 5025.00,
        "averageRating": 4.9
      }
    ]
  }
}
```

---

## 👥 User Management

### GET /users/profile

Get current user profile.

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "avatar": "https://cloudinary.com/avatar.jpg",
    "role": "CUSTOMER",
    "isActive": true,
    "customerProfile": {
      "preferences": {
        "hairType": "STRAIGHT",
        "allergies": ["NONE"],
        "stylePreferences": ["NATURAL", "LOW_MAINTENANCE"]
      },
      "loyaltyTier": "SILVER",
      "totalPoints": 1250
    },
    "salonMemberships": [
      {
        "salonId": "uuid",
        "salonName": "Elegant Hair Salon",
        "role": "CUSTOMER",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /users/profile

Update user profile.

**Request Body:**

```typescript
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "preferences": {
    "hairType": "STRAIGHT",
    "allergies": ["NONE"],
    "stylePreferences": ["NATURAL", "LOW_MAINTENANCE"]
  }
}
```

### POST /users/avatar

Upload user avatar.

**Request Body (multipart/form-data):**

```typescript
{
  "avatar": File
}
```

---

## 🔔 Notification Endpoints

### GET /notifications

Get user notifications.

**Query Parameters:**

```typescript
{
  "page": 1,
  "limit": 20,
  "type": "BOOKING", // BOOKING, LOYALTY, SYSTEM
  "read": false
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "BOOKING",
        "title": "Booking Confirmed",
        "message": "Your appointment at Elegant Hair Salon has been confirmed",
        "data": {
          "bookingId": "uuid",
          "salonId": "uuid",
          "appointmentDate": "2024-01-15T14:00:00Z"
        },
        "read": false,
        "createdAt": "2024-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### PUT /notifications/:id/read

Mark notification as read.

### POST /notifications/preferences

Update notification preferences.

**Request Body:**

```typescript
{
  "email": {
    "bookingConfirmations": true,
    "bookingReminders": true,
    "loyaltyUpdates": true,
    "marketing": false
  },
  "push": {
    "bookingConfirmations": true,
    "bookingReminders": true,
    "loyaltyUpdates": true,
    "marketing": false
  },
  "sms": {
    "bookingReminders": true,
    "urgentUpdates": true
  }
}
```

---

## ⭐ Review Endpoints

### POST /reviews

Submit a review for a salon.

**Request Body:**

```typescript
{
  "salonId": "uuid",
  "bookingId": "uuid", // optional
  "rating": 5,
  "comment": "Excellent service! The stylist was very professional and the result was amazing."
}
```

### GET /reviews/salon/:id

Get salon reviews.

**Query Parameters:**

```typescript
{
  "page": 1,
  "limit": 20,
  "rating": 5, // filter by rating
  "sortBy": "date", // date, rating
  "sortOrder": "desc"
}
```

**Response (200):**

```typescript
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "customerId": "uuid",
        "customerName": "John Doe",
        "customerAvatar": "https://cloudinary.com/avatar.jpg",
        "rating": 5,
        "comment": "Excellent service!",
        "isVerified": true,
        "createdAt": "2024-01-10T10:00:00Z"
      }
    ],
    "summary": {
      "averageRating": 4.8,
      "totalReviews": 156,
      "ratingDistribution": {
        "5": 89,
        "4": 45,
        "3": 15,
        "2": 5,
        "1": 2
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

## 🛡️ Error Responses

### Standard Error Format

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "timestamp": "2024-01-10T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### Common Error Codes

```typescript
enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',

  // Business Logic
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  INSUFFICIENT_POINTS = 'INSUFFICIENT_POINTS',
  SUBSCRIPTION_LIMIT = 'SUBSCRIPTION_LIMIT',

  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **202**: Accepted (for async operations)
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity
- **429**: Too Many Requests
- **500**: Internal Server Error
- **503**: Service Unavailable

---

## 📚 API Documentation

### Swagger/OpenAPI

The complete API documentation is available at:

```
Development: http://localhost:3000/api-docs
Production: https://api.hairsalonecosystem.com/api-docs
```

### Postman Collection

Import the Postman collection from:

```
https://api.hairsalonecosystem.com/postman-collection.json
```

### SDKs

Official SDKs are available for:

- **JavaScript/TypeScript**: `npm install @hairsalonecosystem/sdk`
- **React Native**: `npm install @hairsalonecosystem/react-native`
- **Python**: `pip install hairsalon-sdk`

---

This API contract provides a comprehensive interface for building both the React Native mobile app and React web dashboard, ensuring consistent data flow and user experience across all platforms.
