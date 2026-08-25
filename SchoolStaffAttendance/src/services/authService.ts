import { authApi } from '../api/services/auth.api';

export const authService = {
  login: authApi.login,
  refreshToken: (token: string) => authApi.refreshToken({ refreshToken: token }),
  logout: (token?: string) => authApi.logout({ refreshToken: token }),
};
