import axiosClient from '../client/axiosClient';
import { SCHOOL_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import { SchoolConfigApiResponse } from '../types/school.api.types';

export const schoolApi = {
  getConfig: async (): Promise<SchoolConfigApiResponse> => {
    const response = await axiosClient.get<ApiResponse<SchoolConfigApiResponse>>(
      SCHOOL_ENDPOINTS.CONFIG
    );
    return response.data.data;
  },
};
