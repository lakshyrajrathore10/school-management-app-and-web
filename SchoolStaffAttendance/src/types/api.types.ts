// ============================================================
//  SAS – API Response Types
// ============================================================

/** Standard API success response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/** Standard API error */
export interface ApiError {
  code?: string | number;
  message: string;
  details?: Record<string, unknown>;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
