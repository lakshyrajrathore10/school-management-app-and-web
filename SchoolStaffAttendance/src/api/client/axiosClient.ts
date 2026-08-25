import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { authRequestInterceptor } from './authInterceptor';
import { createErrorResponseInterceptor } from './errorInterceptor';

/**
 * Singleton Axios HTTP Client
 */
export const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request Interceptor (Bearer token)
axiosClient.interceptors.request.use(authRequestInterceptor, error => Promise.reject(error));

// Response Interceptor (401 Refresh & Error Normalization)
axiosClient.interceptors.response.use(
  response => response,
  createErrorResponseInterceptor(axiosClient)
);

export default axiosClient;
