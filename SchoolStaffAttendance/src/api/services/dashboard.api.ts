import axiosClient from '../client/axiosClient';
import { DASHBOARD_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import { DashboardApiResponse } from '../types/dashboard.api.types';

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardApiResponse> => {
    const response = await axiosClient.get<ApiResponse<DashboardApiResponse>>(
      DASHBOARD_ENDPOINTS.METRICS
    );
    return response.data.data;
  },
};
