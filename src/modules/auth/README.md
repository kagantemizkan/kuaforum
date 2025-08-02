# Authentication System

## Overview

This authentication system provides comprehensive user management for the Hair Salon Ecosystem with support for multiple user roles, JWT tokens, OAuth integration, and role-based access control.

## Features

### ✅ Core Authentication
- **JWT Access Tokens**: Short-lived tokens (15 minutes) for API access
- **Refresh Tokens**: Long-lived tokens (7 days) for token renewal
- **Password Security**: bcrypt hashing with configurable rounds
- **Account Management**: User activation/deactivation support

### ✅ User Roles & Registration Rules
- **Customer**: Can register freely, supports OAuth (Google/Apple)
- **Salon Owner**: Requires salon information during registration
- **Staff**: Cannot self-register, created by salon owners only
- **Admin**: Manual creation only, cannot self-register

### ✅ OAuth Integration (Ready for Implementation)
- **Google OAuth**: Token-based authentication
- **Apple OAuth**: Identity token authentication
- **Automatic User Creation**: Creates customer profiles for OAuth users

### ✅ Role-Based Access Control
- **Guards**: JWT authentication and role-based authorization
- **Decorators**: `@Public()`, `@Roles()`, `@CurrentUser()`
- **Multi-tenant Support**: Salon-specific access control

### ✅ Security Features
- **Token Blacklisting**: Refresh token invalidation on logout
- **Account Security**: Password complexity requirements
- **Input Validation**: Comprehensive DTO validation
- **Error Handling**: Secure error messages

## API Endpoints

### Public Endpoints (No Authentication Required)

#### POST `/auth/register`
Register a new user account.

**Customer Registration:**
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER"
}
```

**Salon Owner Registration:**
```json
{
  "email": "owner@salon.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "SALON_OWNER",
  "salonData": {
    "salonName": "Beautiful Hair Salon",
    "salonAddress": "123 Main Street",
    "salonCity": "New York",
    "salonCountry": "USA",
    "salonPhone": "+1234567890",
    "salonEmail": "info@salon.com",
    "salonWebsite": "https://salon.com",
    "salonDescription": "Premium hair salon services"
  }
}
```

#### POST `/auth/login`
Authenticate with email and password.

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### POST `/auth/refresh`
Refresh access token using refresh token.

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/oauth/google`
Authenticate with Google OAuth.

```json
{
  "accessToken": "ya29.a0ARrdaM9...",
  "idToken": "eyJhbGciOiJSUzI1NiIs..." // optional
}
```

#### POST `/auth/oauth/apple`
Authenticate with Apple OAuth.

```json
{
  "identityToken": "eyJraWQiOiJlWGF1bm1MIiwiYWxnIjoiUlMyNTYifQ...",
  "authorizationCode": "c6a9d4c8e7f4b2d3a1e5f8c9b2d4e7f1a3c5e8f9", // optional
  "email": "user@privaterelay.appleid.com", // optional, first sign-in only
  "firstName": "John", // optional, first sign-in only
  "lastName": "Doe" // optional, first sign-in only
}
```

### Protected Endpoints (Authentication Required)

#### POST `/auth/logout`
Logout user and invalidate refresh tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body (optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/auth/me`
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### GET `/auth/status`
Check authentication status.

**Headers:**
```
Authorization: Bearer <access_token>
```

## Usage Examples

### Using Guards and Decorators

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser, Public } from '../auth/decorators';
import { UserRole } from '@prisma/client';

@Controller('example')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExampleController {
  
  @Public() // No authentication required
  @Get('public')
  publicEndpoint() {
    return { message: 'This is public' };
  }

  @Get('protected')
  protectedEndpoint(@CurrentUser() user: any) {
    return { message: `Hello ${user.firstName}` };
  }

  @Roles(UserRole.SALON_OWNER, UserRole.ADMIN)
  @Post('owner-only')
  ownerOnlyEndpoint(@CurrentUser() user: any) {
    return { message: 'Only salon owners and admins can access this' };
  }

  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminOnlyEndpoint() {
    return { message: 'Admin only endpoint' };
  }
}
```

### Authentication Flow

1. **Registration/Login**: User receives access token (15min) and refresh token (7d)
2. **API Requests**: Include `Authorization: Bearer <access_token>` header
3. **Token Refresh**: When access token expires, use refresh token to get new tokens
4. **Logout**: Invalidate refresh tokens

### Error Responses

The authentication system returns consistent error responses:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

Common error codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials/token)
- `403`: Forbidden (insufficient permissions, account restrictions)
- `409`: Conflict (user already exists)

## Configuration

Required environment variables:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL="postgresql://..."

# Security
BCRYPT_ROUNDS=12

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_TEAM_ID=""
APPLE_KEY_ID=""
APPLE_PRIVATE_KEY=""
```

## Database Schema

The authentication system uses the following Prisma models:

- `User`: Core user information and authentication
- `RefreshToken`: Refresh token management
- `CustomerProfile`: Customer-specific data
- `Salon`: Salon information for owners
- `SalonMember`: Multi-tenant salon membership
- `Staff`: Staff roles and permissions

## Security Considerations

1. **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
2. **Token Security**: Short-lived access tokens with secure refresh mechanism
3. **Role Enforcement**: Strict role-based registration and access control
4. **Multi-tenancy**: Salon-specific data isolation
5. **OAuth Security**: Token verification for third-party authentication

## Future Enhancements

The system is designed to support:

1. **Paywall Integration**: Subscription status checks for salon owners
2. **Two-Factor Authentication**: SMS/Email verification
3. **Social Login**: Additional OAuth providers
4. **Advanced Permissions**: Granular permission system
5. **Audit Logging**: Authentication event tracking

## Testing

Use the provided DTOs and validation schemas to ensure proper request formatting. The system includes comprehensive error handling and validation for all endpoints.

## Support

For questions or issues with the authentication system, refer to the API documentation or contact the development team.