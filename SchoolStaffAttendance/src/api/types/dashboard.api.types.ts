import { StaffProfile } from '../../types/user.types';
import { TodayStatusApiResponse } from './attendance.api.types';

export interface DashboardApiResponse {
  staff: StaffProfile;
  school: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    allowedRadiusMeters: number;
  };
  today: TodayStatusApiResponse;
  monthlySummary: {
    presentDays: number;
    lateDays: number;
    absentDays: number;
    leavesTaken: number;
  };
  unreadNotificationsCount: number;
}
