import { tokenStorage } from './storage/tokenStorage';
import { sessionStorage } from './storage/sessionStorage';
import { StaffProfile } from '../types/user.types';
import { STORAGE_KEYS } from '../constants/appConstants';

export { tokenStorage, sessionStorage };

export const storageService = {
  saveAuthToken: (token: string): void => tokenStorage.setAccessToken(token),
  getAuthToken: (): string | undefined => tokenStorage.getAccessToken(),
  removeAuthToken: (): void => tokenStorage.removeAccessToken(),

  saveRefreshToken: (token: string): void => tokenStorage.setRefreshToken(token),
  getRefreshToken: (): string | undefined => tokenStorage.getRefreshToken(),
  removeRefreshToken: (): void => tokenStorage.removeRefreshToken(),

  saveUserProfile: (profile: StaffProfile): void => sessionStorage.setUserProfile(profile),
  getUserProfile: (): StaffProfile | null => sessionStorage.getUserProfile(),
  removeUserProfile: (): void => sessionStorage.removeUserProfile(),

  saveFcmToken: (token: string): void => tokenStorage.storage.set(STORAGE_KEYS.FCM_TOKEN, token),
  getFcmToken: (): string | undefined => tokenStorage.storage.getString(STORAGE_KEYS.FCM_TOKEN),

  hasValidSession: (): boolean => sessionStorage.hasValidSession(),
  clearAll: (): void => tokenStorage.storage.clearAll(),
  clearSession: (): void => sessionStorage.clearSession(),
};
