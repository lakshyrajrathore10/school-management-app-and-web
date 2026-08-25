/** Standard API success response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/** Standard API error payload */
export interface ApiErrorPayload {
  code?: string | number;
  message: string;
  details?: Record<string, unknown>;
}

/** Standard Paginated response payload */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
