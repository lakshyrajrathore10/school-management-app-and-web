import { staffApi } from '../api/services/staff.api';
export * from '../api/types/staff.api.types';

export const profileService = {
  fetchProfile: staffApi.getProfile,
  updateProfile: staffApi.updateProfile,
  changePassword: (cp: string, np: string) => staffApi.changePassword({ currentPassword: cp, newPassword: np }),
};
