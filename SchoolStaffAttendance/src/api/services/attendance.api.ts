import axiosClient from '../client/axiosClient';
import { ATTENDANCE_ENDPOINTS } from '../endpoints';
import { ApiResponse, PaginatedResponse } from '../types/common.api.types';
import {
  AttendanceDetailApiResponse,
  AttendanceHistoryApiItem,
  CheckInApiRequest,
  CheckInApiResponse,
  CheckOutApiRequest,
  CheckOutApiResponse,
  TodayStatusApiResponse,
} from '../types/attendance.api.types';

export const attendanceApi = {
  getTodayStatus: async (): Promise<TodayStatusApiResponse> => {
    const response = await axiosClient.get<ApiResponse<TodayStatusApiResponse>>(
      ATTENDANCE_ENDPOINTS.TODAY
    );
    return response.data.data;
  },

  checkIn: async (payload: CheckInApiRequest): Promise<CheckInApiResponse> => {
    const response = await axiosClient.post<ApiResponse<CheckInApiResponse>>(
      ATTENDANCE_ENDPOINTS.CHECK_IN,
      payload
    );
    return response.data.data;
  },

  checkOut: async (payload: CheckOutApiRequest): Promise<CheckOutApiResponse> => {
    const response = await axiosClient.post<ApiResponse<CheckOutApiResponse>>(
      ATTENDANCE_ENDPOINTS.CHECK_OUT,
      payload
    );
    return response.data.data;
  },

  getHistory: async (params?: {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    month?: string;
  }): Promise<PaginatedResponse<AttendanceHistoryApiItem>> => {
    const response = await axiosClient.get<ApiResponse<PaginatedResponse<AttendanceHistoryApiItem>>>(
      ATTENDANCE_ENDPOINTS.HISTORY,
      { params }
    );
    return response.data.data;
  },

  getDetail: async (id: string): Promise<AttendanceDetailApiResponse> => {
    const response = await axiosClient.get<ApiResponse<AttendanceDetailApiResponse>>(
      ATTENDANCE_ENDPOINTS.DETAIL(id)
    );
    return response.data.data;
  },
};
