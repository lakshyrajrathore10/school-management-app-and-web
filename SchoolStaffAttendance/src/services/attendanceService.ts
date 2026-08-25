import { attendanceApi } from '../api/services/attendance.api';
export * from '../api/types/attendance.api.types';

export const attendanceService = {
  fetchTodayStatus: attendanceApi.getTodayStatus,
  checkIn: attendanceApi.checkIn,
  checkOut: attendanceApi.checkOut,
  fetchHistory: attendanceApi.getHistory,
  fetchDetail: attendanceApi.getDetail,
};
