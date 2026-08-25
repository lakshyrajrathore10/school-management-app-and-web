import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '../../constants/appConstants';

export const storage = new MMKV({
  id: 'sas-token-storage',
});

/**
 * Dedicated Token Storage Abstraction
 */
export const tokenStorage = {
  storage,

  getAccessToken: (): string | undefined => {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  },

  setAccessToken: (token: string): void => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeAccessToken: (): void => {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
  },

  getRefreshToken: (): string | undefined => {
    return storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  removeRefreshToken: (): void => {
    storage.delete(STORAGE_KEYS.REFRESH_TOKEN);
  },

  clearTokens: (): void => {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
    storage.delete(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
