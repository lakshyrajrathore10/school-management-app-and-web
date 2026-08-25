import { dashboardApi } from '../api/services/dashboard.api';
import { DashboardApiResponse } from '../api/types/dashboard.api.types';
export * from '../api/types/dashboard.api.types';

export type DashboardDataResponse = DashboardApiResponse;

export const dashboardService = {
  fetchDashboardData: dashboardApi.getMetrics,
};
