import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OAuth settings
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/v1/auth/google/callback',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID,
      teamId: process.env.APPLE_TEAM_ID,
      keyId: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      callbackUrl: process.env.APPLE_CALLBACK_URL || 'http://localhost:3000/v1/auth/apple/callback',
    },
  },
}));