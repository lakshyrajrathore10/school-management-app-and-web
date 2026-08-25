import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { tokenStorage } from '../../services/storage/tokenStorage';
import { sessionStorage } from '../../services/storage/sessionStorage';

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(item => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
};

export async function handleRefreshTokenFlow(originalRequest: any, axiosInstance: any): Promise<any> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(newToken => {
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return axiosInstance(originalRequest);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  const currentRefreshToken = tokenStorage.getRefreshToken();

  if (!currentRefreshToken) {
    sessionStorage.clearSession();
    isRefreshing = false;
    return Promise.reject(new Error('No refresh token available.'));
  }

  try {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      refreshToken: currentRefreshToken,
    });

    const newAccessToken = response.data.data.token;
    const newRefreshToken = response.data.data.refreshToken;

    tokenStorage.setAccessToken(newAccessToken);
    if (newRefreshToken) {
      tokenStorage.setRefreshToken(newRefreshToken);
    }

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    }

    processQueue(null, newAccessToken);
    isRefreshing = false;

    return axiosInstance(originalRequest);
  } catch (error) {
    processQueue(error, null);
    sessionStorage.clearSession();
    isRefreshing = false;
    return Promise.reject(error);
  }
}
