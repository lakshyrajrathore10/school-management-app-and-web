import axiosClient from '../client/axiosClient';
import { AUTH_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import {
  LoginApiRequest,
  LoginApiResponse,
  LogoutApiRequest,
  RefreshApiRequest,
} from '../types/auth.api.types';

export const authApi = {
  login: async (credentials: LoginApiRequest): Promise<LoginApiResponse> => {
    const response = await axiosClient.post<ApiResponse<LoginApiResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
    return response.data.data;
  },

  refreshToken: async (payload: RefreshApiRequest): Promise<LoginApiResponse> => {
    const response = await axiosClient.post<ApiResponse<LoginApiResponse>>(
      AUTH_ENDPOINTS.REFRESH,
      payload
    );
    return response.data.data;
  },

  logout: async (payload?: LogoutApiRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post<ApiResponse<{ message: string }>>(
        AUTH_ENDPOINTS.LOGOUT,
        payload
      );
      return response.data.data;
    } catch {
      return { message: 'Logged out.' };
    }
  },
};
