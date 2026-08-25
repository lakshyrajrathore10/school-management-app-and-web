import axiosClient from '../client/axiosClient';
import { LEAVE_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import { ApplyLeaveApiRequest, LeaveApiItem, LeaveQuotaApiItem } from '../types/leave.api.types';

export const leaveApi = {
  getLeaves: async (): Promise<LeaveApiItem[]> => {
    const response = await axiosClient.get<ApiResponse<LeaveApiItem[]>>(LEAVE_ENDPOINTS.LIST);
    return response.data.data;
  },

  applyLeave: async (payload: ApplyLeaveApiRequest): Promise<LeaveApiItem> => {
    const response = await axiosClient.post<ApiResponse<LeaveApiItem>>(
      LEAVE_ENDPOINTS.APPLY,
      payload
    );
    return response.data.data;
  },

  getQuotas: async (): Promise<LeaveQuotaApiItem[]> => {
    const response = await axiosClient.get<ApiResponse<LeaveQuotaApiItem[]>>(LEAVE_ENDPOINTS.QUOTAS);
    return response.data.data;
  },

  getDetail: async (id: string): Promise<LeaveApiItem> => {
    const response = await axiosClient.get<ApiResponse<LeaveApiItem>>(LEAVE_ENDPOINTS.DETAIL(id));
    return response.data.data;
  },

  cancelLeave: async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.patch<ApiResponse<{ message: string }>>(
      LEAVE_ENDPOINTS.CANCEL(id)
    );
    return response.data.data;
  },
};
