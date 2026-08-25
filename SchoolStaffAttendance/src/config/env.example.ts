/**
 * Example env config — copy to env.ts and fill real values
 */
export const ENV = {
  BASE_URL: 'https://api.sas.school',
  GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
  FIREBASE_SENDER_ID: 'YOUR_FIREBASE_SENDER_ID',
  APP_VERSION: '1.0.0',
  APP_ENV: 'development' as 'development' | 'staging' | 'production',
} as const;