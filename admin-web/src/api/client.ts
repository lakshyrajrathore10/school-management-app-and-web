import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor to append JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sas_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401 & automatic token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('sas_admin_refresh_token');

      // Do not attempt refresh on auth endpoints or if refresh token missing
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh') || !refreshToken) {
        localStorage.removeItem('sas_admin_token');
        localStorage.removeItem('sas_admin_refresh_token');
        localStorage.removeItem('sas_admin_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        const message = error.response?.data?.error?.message || error.response?.data?.message || 'Authentication failed.';
        return Promise.reject({ ...error.response?.data, message });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const data = response.data?.data || response.data;
        const newToken = data.token || data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (newToken) {
          localStorage.setItem('sas_admin_token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('sas_admin_refresh_token', newRefreshToken);
          }
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No token returned from refresh.');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('sas_admin_token');
        localStorage.removeItem('sas_admin_refresh_token');
        localStorage.removeItem('sas_admin_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject({ ...error.response?.data, message });
  }
);

export default apiClient;
