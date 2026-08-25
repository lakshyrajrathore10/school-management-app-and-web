import { StaffProfile } from './user.types';

// ============================================================
//  SAS – Authentication Types
// ============================================================

export interface LoginRequest {
  /** Employee ID provided by school admin */
  employeeId: string;
  /** Password */
  password: string;
}

export interface LoginResponse {
  /** JWT access token */
  token: string;
  /** Refresh token (if supported) */
  refreshToken?: string;
  /** Staff profile */
  user: StaffProfile;
  /** Token expiry (ISO string) */
  expiresAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StaffProfile | null;
  token: string | null;
  error: string | null;
}
