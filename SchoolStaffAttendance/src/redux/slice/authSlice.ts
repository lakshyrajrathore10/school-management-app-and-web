import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginResponse } from '../../types/auth.types';
import { storageService } from '../../services/storageService';

// ============================================================
//  SAS – Auth Slice
//  Manages authentication state (token, user, loading, error)
// ============================================================

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Called when login starts (API request in flight).
     */
    loginStart: state => {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Called when login succeeds. Stores token & user in Redux
     * and persists them to MMKV storage.
     */
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;

      // Persist session
      storageService.saveAuthToken(action.payload.token);
      if (action.payload.refreshToken) {
        storageService.saveRefreshToken(action.payload.refreshToken);
      }
      storageService.saveUserProfile(action.payload.user);
    },

    /**
     * Called when login fails.
     */
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    /**
     * Restores session from MMKV on app startup (Splash screen).
     */
    restoreSession: state => {
      const token = storageService.getAuthToken();
      const user = storageService.getUserProfile();
      if (token && user) {
        state.isAuthenticated = true;
        state.token = token;
        state.user = user;
      }
    },

    /**
     * Clears all auth state and MMKV session (logout).
     */
    logout: state => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.error = null;
      storageService.clearSession();
    },

    /**
     * Clears any stored error (e.g. when user dismisses snackbar).
     */
    clearAuthError: state => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  restoreSession,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
