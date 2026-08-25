import axiosClient from '../client/axiosClient';
import { UPLOAD_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import { UploadApiResponse } from '../types/upload.api.types';
import { API_CONFIG } from '../config/apiConfig';

export const uploadApi = {
  uploadFile: async (formData: FormData): Promise<UploadApiResponse> => {
    const response = await axiosClient.post<ApiResponse<UploadApiResponse>>(
      UPLOAD_ENDPOINTS.UPLOAD,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: API_CONFIG.UPLOAD_TIMEOUT,
      }
    );
    return response.data.data;
  },
};
