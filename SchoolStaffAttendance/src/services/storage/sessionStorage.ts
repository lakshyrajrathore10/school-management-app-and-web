import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '../../constants/appConstants';
import { StaffProfile } from '../../types/user.types';
import { tokenStorage } from './tokenStorage';

export const sessionStorage = {
  getUserProfile: (): StaffProfile | null => {
    const raw = tokenStorage.storage.getString(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StaffProfile;
    } catch {
      return null;
    }
  },

  setUserProfile: (profile: StaffProfile): void => {
    tokenStorage.storage.set(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  removeUserProfile: (): void => {
    tokenStorage.storage.delete(STORAGE_KEYS.USER_PROFILE);
  },

  hasValidSession: (): boolean => {
    const token = tokenStorage.getAccessToken();
    return typeof token === 'string' && token.length > 0;
  },

  clearSession: (): void => {
    tokenStorage.clearTokens();
    tokenStorage.storage.delete(STORAGE_KEYS.USER_PROFILE);
  },
};
