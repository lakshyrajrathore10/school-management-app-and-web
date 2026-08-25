import { notificationApi } from '../api/services/notification.api';
export * from '../api/types/notification.api.types';

export const notificationService = {
  fetchNotifications: notificationApi.getNotifications,
  markRead: notificationApi.markRead,
  markAllRead: notificationApi.markAllRead,
  deleteNotification: notificationApi.deleteNotification,
};
