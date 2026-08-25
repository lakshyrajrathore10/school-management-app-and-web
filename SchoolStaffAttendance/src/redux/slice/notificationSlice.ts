import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================
//  SAS – Notifications Redux Slice
// ============================================================

export type NotificationType =
  | 'ATTENDANCE_REMINDER'
  | 'MEETING_NOTICE'
  | 'HOLIDAY_NOTICE'
  | 'LEAVE_APPROVAL'
  | 'GENERAL_CIRCULAR';

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  timestamp: string;
  date: string;
}

export interface NotificationState {
  notifications: NotificationRecord[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationRecord[]>) => {
      state.notifications = action.payload;
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },

    markAllAsRead: state => {
      state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
    },

    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const { setNotifications, markAsRead, markAllAsRead, deleteNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
