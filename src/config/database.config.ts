import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  
  // Connection pool settings
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT || '30000', 10),
    destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000', 10),
    createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL || '200', 10),
  },

  // Logging
  logging: process.env.NODE_ENV === 'development',
}));