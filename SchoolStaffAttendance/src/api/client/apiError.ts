import { AxiosError } from 'axios';

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'OUTSIDE_GEOFENCE'
  | 'MOCK_GPS_DETECTED'
  | 'LOW_ACCURACY'
  | 'STALE_TIMESTAMP'
  | 'ALREADY_CHECKED_IN'
  | 'NOT_CHECKED_IN'
  | 'ALREADY_CHECKED_OUT'
  | 'OVERLAPPING_LEAVE'
  | 'UNKNOWN_ERROR';

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode?: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ApiErrorCode = 'UNKNOWN_ERROR',
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromAxiosError(error: AxiosError<any>): ApiError {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiError('Request timed out. Please try again.', 'TIMEOUT', 408);
      }
      return new ApiError(
        'Network error. Please check your internet connection.',
        'NETWORK_ERROR',
        0
      );
    }

    const statusCode = error.response.status;
    const responseData = error.response.data;

    const message =
      responseData?.error?.message ||
      responseData?.message ||
      error.message ||
      'An error occurred during API request.';

    const rawCode = responseData?.error?.code || responseData?.code;
    const code: ApiErrorCode = typeof rawCode === 'string' ? (rawCode as ApiErrorCode) : this.mapStatusCodeToCode(statusCode);

    return new ApiError(message, code, statusCode, responseData?.error?.details);
  }

  private static mapStatusCodeToCode(statusCode: number): ApiErrorCode {
    switch (statusCode) {
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
      case 400:
        return 'VALIDATION_ERROR';
      case 500:
      default:
        return 'SERVER_ERROR';
    }
  }
}
