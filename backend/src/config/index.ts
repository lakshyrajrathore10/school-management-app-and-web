import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'School Staff Attendance API',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sas_db',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-key-12345',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-67890',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '2000', 10),
  },

  schoolDefault: {
    name: process.env.SCHOOL_NAME || 'Whiteleaf International School',
    latitude: parseFloat(process.env.SCHOOL_LATITUDE || '22.719568'),
    longitude: parseFloat(process.env.SCHOOL_LONGITUDE || '75.857727'),
    allowedRadiusMeters: parseFloat(process.env.SCHOOL_RADIUS_METERS || '200'),
    timezone: process.env.SCHOOL_TIMEZONE || 'Asia/Kolkata',
    shiftStartTime: process.env.SHIFT_START_TIME || '09:00',
    shiftEndTime: process.env.SHIFT_END_TIME || '17:00',
    graceMinutes: parseInt(process.env.GRACE_MINUTES || '15', 10),
  },

  uploads: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
  },
};
