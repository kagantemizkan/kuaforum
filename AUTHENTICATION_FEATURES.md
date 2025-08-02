# Authentication Features

This document describes the new authentication features added to the Hair Salon Ecosystem, including SMS OTP verification and OAuth integration with Google and Apple.

## Features Overview

### 1. SMS OTP Authentication
- Phone number verification for registration and login
- Twilio integration for SMS delivery
- Rate limiting and security measures
- Support for multiple purposes (registration, login, password reset)

### 2. OAuth Integration
- Google OAuth 2.0 authentication
- Apple Sign In support
- Automatic user creation and linking
- Secure token verification

### 3. Enhanced Registration Flow
- Multiple registration options: Email/Password, Phone OTP, OAuth
- Phone number verification
- User-friendly UI components

## Backend Implementation

### Database Schema Changes

New fields added to the `User` model:
```prisma
model User {
  // ... existing fields
  isPhoneVerified Boolean  @default(false)
  isEmailVerified Boolean  @default(false)
  password        String?  // Optional for OAuth users
  googleId        String?  @unique
  appleId         String?  @unique
  otpVerifications OTPVerification[]
}
```

New `OTPVerification` model:
```prisma
model OTPVerification {
  id        String   @id @default(uuid())
  userId    String
  phone     String
  otp       String
  purpose   String   // 'registration', 'login', 'password_reset'
  verified  Boolean  @default(false)
  attempts  Int      @default(0)
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### New API Endpoints

#### SMS OTP Endpoints
- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/register-phone` - Complete phone registration

#### Enhanced OAuth Endpoints
- `POST /auth/oauth/google` - Google OAuth authentication
- `POST /auth/oauth/apple` - Apple OAuth authentication

### Services

#### SmsOtpService
- Handles OTP generation and verification
- Integrates with Twilio for SMS delivery
- Implements rate limiting and security measures
- Manages OTP lifecycle and cleanup

#### OAuthService
- Handles Google and Apple token verification
- Creates or links user accounts
- Manages OAuth provider relationships

### Security Features

1. **Rate Limiting**: Prevents OTP spam (1 request per minute)
2. **Attempt Limiting**: Maximum 5 verification attempts per OTP
3. **Expiration**: OTPs expire after 10 minutes
4. **Token Verification**: Proper OAuth token validation
5. **Data Validation**: Comprehensive input validation

## Frontend Implementation

### New Components

#### OTPVerification Component
```tsx
<OTPVerification
  onSuccess={(data) => console.log('OTP verified', data)}
  onError={(error) => console.error('OTP error', error)}
  purpose="registration"
  title="Phone Verification"
  subtitle="Enter your phone number to receive a verification code"
/>
```

Features:
- Phone number input with country selection
- OTP code input with validation
- Resend functionality with countdown
- Error handling and user feedback

#### OAuthSignIn Component
```tsx
<OAuthSignIn
  onSuccess={(data) => console.log('OAuth success', data)}
  onError={(error) => console.error('OAuth error', error)}
  mode="login"
  googleClientId="your-google-client-id"
/>
```

Features:
- Google Sign In button
- Apple Sign In button (placeholder for web)
- Proper error handling
- Success callbacks

#### PhoneRegistration Component
```tsx
<PhoneRegistration
  onSuccess={(data) => console.log('Registration success', data)}
  onError={(error) => console.error('Registration error', error)}
  allowedRoles={['CUSTOMER', 'SALON_OWNER']}
/>
```

Features:
- Multi-step registration flow
- User information collection
- Phone verification integration
- Role selection

### Updated API Client

New methods added to `ApiService.auth`:
```typescript
// OTP methods
sendOTP(data: { phone: string; purpose?: string; userId?: string })
verifyOTP(data: { phone: string; otp: string; purpose?: string; userId?: string })
registerWithPhone(data: { phone: string; firstName: string; lastName: string; role?: string })

// Enhanced OAuth methods
googleOAuth(data: { accessToken: string; idToken?: string })
appleOAuth(data: { identityToken: string; authorizationCode?: string })
```

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth Configuration
APPLE_CLIENT_ID=com.yourapp.service
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

#### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:3000/v1
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_ENABLE_OTP_LOGIN=true
REACT_APP_ENABLE_OAUTH_LOGIN=true
```

## Usage Examples

### 1. Phone Registration Flow

```typescript
// Step 1: User enters phone number and personal info
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  role: 'CUSTOMER'
};

// Step 2: Send OTP
await ApiClient.auth.sendOTP({
  phone: '+1234567890',
  purpose: 'registration'
});

// Step 3: Verify OTP
await ApiClient.auth.verifyOTP({
  phone: '+1234567890',
  otp: '123456',
  purpose: 'registration'
});

// Step 4: Complete registration
const response = await ApiClient.auth.registerWithPhone({
  phone: '+1234567890',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CUSTOMER'
});
```

### 2. Google OAuth Flow

```typescript
// Frontend: Get Google token
const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    // Backend: Verify and authenticate
    const response = await ApiClient.auth.googleOAuth({
      accessToken: tokenResponse.access_token,
      idToken: tokenResponse.id_token,
    });
    
    // Handle successful authentication
    console.log('User authenticated:', response.data.user);
  }
});
```

### 3. OTP Login Flow

```typescript
// Step 1: Send OTP for login
await ApiClient.auth.sendOTP({
  phone: '+1234567890',
  purpose: 'login',
  userId: 'existing-user-id'
});

// Step 2: Verify OTP
const response = await ApiClient.auth.verifyOTP({
  phone: '+1234567890',
  otp: '123456',
  purpose: 'login',
  userId: 'existing-user-id'
});
```

## Testing

### Backend Testing

Use the API testing interface at `/auth-testing` to test all endpoints:

1. **Send OTP**: Test phone number validation and OTP delivery
2. **Verify OTP**: Test OTP code validation and user verification
3. **Phone Registration**: Test complete registration flow
4. **OAuth**: Test Google and Apple authentication flows

### Frontend Testing

The testing page includes interactive forms for:
- SMS OTP sending and verification
- Phone number registration
- OAuth authentication testing
- Response inspection and debugging

## Security Considerations

1. **Phone Verification**: Always verify phone numbers before allowing registration
2. **Rate Limiting**: Implement proper rate limiting for OTP requests
3. **Token Security**: Store OAuth tokens securely and validate properly
4. **Input Validation**: Validate all inputs on both client and server
5. **Error Handling**: Don't expose sensitive information in error messages

## Troubleshooting

### Common Issues

1. **Twilio SMS not working**:
   - Check Twilio credentials in environment variables
   - Verify phone number format (+1234567890)
   - Check Twilio account balance and phone number verification

2. **Google OAuth failing**:
   - Verify Google Client ID in both backend and frontend
   - Check OAuth consent screen configuration
   - Ensure proper redirect URIs are configured

3. **OTP verification failing**:
   - Check OTP expiration (10 minutes)
   - Verify attempt limits (max 5 attempts)
   - Ensure phone number matches exactly

4. **Database issues**:
   - Run `npx prisma generate` after schema changes
   - Run `npx prisma migrate dev` to apply migrations
   - Check database connection and permissions

## Future Enhancements

1. **Apple Sign In for Web**: Implement proper Apple Sign In for web applications
2. **SMS Templates**: Add customizable SMS templates for different purposes
3. **Multi-factor Authentication**: Combine phone and email verification
4. **Social Logins**: Add support for Facebook, Twitter, etc.
5. **Biometric Authentication**: Add fingerprint/face recognition for mobile apps
6. **Backup Codes**: Provide backup authentication codes
7. **Account Recovery**: Enhanced account recovery with multiple verification methods

## Dependencies

### Backend
- `twilio`: SMS service integration
- `google-auth-library`: Google OAuth token verification
- `apple-signin-auth`: Apple Sign In token verification

### Frontend
- `@react-oauth/google`: Google OAuth integration
- `react-phone-input-2`: International phone number input
- `antd`: UI components

## Migration Guide

To add these features to an existing installation:

1. **Update dependencies**:
   ```bash
   npm install twilio google-auth-library apple-signin-auth
   cd frontend && npm install @react-oauth/google react-phone-input-2
   ```

2. **Update database schema**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Configure environment variables** (see Configuration section)

4. **Update frontend components** to use new authentication methods

5. **Test all flows** using the testing interface

This completes the implementation of SMS OTP and OAuth authentication features for the Hair Salon Ecosystem.