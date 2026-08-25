import axiosClient from '../client/axiosClient';
import { STAFF_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import {
  ChangePasswordApiRequest,
  StaffProfileResponse,
  UpdateProfileApiRequest,
} from '../types/staff.api.types';

export const staffApi = {
  getProfile: async (): Promise<StaffProfileResponse> => {
    const response = await axiosClient.get<ApiResponse<StaffProfileResponse>>(
      STAFF_ENDPOINTS.PROFILE
    );
    return response.data.data;
  },

  updateProfile: async (payload: UpdateProfileApiRequest): Promise<StaffProfileResponse> => {
    const response = await axiosClient.patch<ApiResponse<StaffProfileResponse>>(
      STAFF_ENDPOINTS.PROFILE,
      payload
    );
    return response.data.data;
  },

  changePassword: async (payload: ChangePasswordApiRequest): Promise<{ message: string }> => {
    const response = await axiosClient.post<ApiResponse<{ message: string }>>(
      STAFF_ENDPOINTS.CHANGE_PASSWORD,
      payload
    );
    return response.data.data;
  },
};
