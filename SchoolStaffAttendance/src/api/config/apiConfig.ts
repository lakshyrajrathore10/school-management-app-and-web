export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5001/api/v1',
  TIMEOUT: 30_000,
  UPLOAD_TIMEOUT: 60_000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
} as const;
 