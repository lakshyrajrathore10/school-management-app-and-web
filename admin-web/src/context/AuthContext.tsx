import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import type { AdminUser } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sas_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sas_admin_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response: any = await apiClient.get('/staff/profile');
          const userData = response.data || response;
          if (userData && !userData.role && token) {
            try {
              const decoded = JSON.parse(atob(token.split('.')[1]));
              userData.role = decoded.role;
            } catch (e) {}
          }
          if (userData && ['ADMIN', 'MANAGER', 'HR'].includes(userData.role)) {
            setUser(userData);
            localStorage.setItem('sas_admin_user', JSON.stringify(userData));
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (employeeId: string, password: string) => {
    const response: any = await apiClient.post('/auth/login', {
      employeeId,
      password,
    });

    const payload = response.data || response;
    const tokenStr = payload.token || payload.tokens?.accessToken;
    const userData = payload.user || {};

    if (!userData.role && tokenStr) {
      try {
        const decoded = JSON.parse(atob(tokenStr.split('.')[1]));
        userData.role = decoded.role;
      } catch (e) {}
    }

    if (!userData.role || !['ADMIN', 'MANAGER', 'HR'].includes(userData.role)) {
      throw new Error('Access denied. Admin portal is restricted to Administrators only.');
    }

    const refreshTokenStr = payload.refreshToken || payload.tokens?.refreshToken;
    setToken(tokenStr);
    setUser(userData);
    localStorage.setItem('sas_admin_token', tokenStr);
    if (refreshTokenStr) {
      localStorage.setItem('sas_admin_refresh_token', refreshTokenStr);
    }
    localStorage.setItem('sas_admin_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sas_admin_token');
    localStorage.removeItem('sas_admin_refresh_token');
    localStorage.removeItem('sas_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
