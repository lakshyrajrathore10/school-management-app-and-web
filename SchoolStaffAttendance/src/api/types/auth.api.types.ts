import { StaffProfile } from '../../types/user.types';

export interface LoginApiRequest {
  employeeId: string;
  password: string;
}

export interface LoginApiResponse {
  token: string;
  refreshToken?: string;
  user: StaffProfile;
  expiresAt?: string;
}

export interface RefreshApiRequest {
  refreshToken: string;
}

export interface LogoutApiRequest {
  refreshToken?: string;
}
