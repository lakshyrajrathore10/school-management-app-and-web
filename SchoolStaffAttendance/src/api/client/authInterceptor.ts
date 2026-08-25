import { InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../../services/storage/tokenStorage';

export function authRequestInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}
