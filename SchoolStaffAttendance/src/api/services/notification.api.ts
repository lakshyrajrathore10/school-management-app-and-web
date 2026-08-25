import axiosClient from '../client/axiosClient';
import { NOTIFICATION_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import { NotificationApiItem } from '../types/notification.api.types';

export const notificationApi = {
  getNotifications: async (): Promise<NotificationApiItem[]> => {
    const response = await axiosClient.get<ApiResponse<NotificationApiItem[]>>(
      NOTIFICATION_ENDPOINTS.LIST
    );
    return response.data.data;
  },

  markRead: async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.patch<ApiResponse<{ message: string }>>(
      NOTIFICATION_ENDPOINTS.MARK_READ(id)
    );
    return response.data.data;
  },

  markAllRead: async (): Promise<{ message: string }> => {
    const response = await axiosClient.patch<ApiResponse<{ message: string }>>(
      NOTIFICATION_ENDPOINTS.MARK_ALL_READ
    );
    return response.data.data;
  },

  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete<ApiResponse<{ message: string }>>(
      NOTIFICATION_ENDPOINTS.DELETE(id)
    );
    return response.data.data;
  },
};
