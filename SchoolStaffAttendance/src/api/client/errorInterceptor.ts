import { AxiosError } from 'axios';
import { handleRefreshTokenFlow } from './refreshToken';
import { ApiError } from './apiError';

export function createErrorResponseInterceptor(axiosInstance: any) {
  return async (error: AxiosError<any>) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      try {
        return await handleRefreshTokenFlow(originalRequest, axiosInstance);
      } catch (refreshErr) {
        return Promise.reject(ApiError.fromAxiosError(error));
      }
    }

    return Promise.reject(ApiError.fromAxiosError(error));
  };
}
