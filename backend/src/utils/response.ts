import { Response } from 'express';

export interface ApiResponsePayload<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string | number;
    message: string;
    details?: Record<string, unknown>;
  };
}

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    code: string | number = 'BAD_REQUEST',
    statusCode = 400,
    details?: Record<string, unknown>
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }

  static paginated<T>(
    res: Response,
    items: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ) {
    return res.status(200).json({
      success: true,
      message,
      data: {
        items,
        total,
        page,
        limit,
        hasMore: page * limit < total,
      },
    });
  }
}
