import { StaffProfile } from '../../types/user.types';

export type StaffProfileResponse = StaffProfile;

export interface UpdateProfileApiRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  department?: string;
  designation?: string;
}

export interface ChangePasswordApiRequest {
  currentPassword: string;
  newPassword: string;
}
