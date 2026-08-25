import { AttendanceStatus } from '../constants/appConstants';
import { LeaveStatus, LeaveType } from '../constants/appConstants';

// ============================================================
//  SAS – Attendance Types
// ============================================================

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;            // ISO date (YYYY-MM-DD)
  checkInTime?: string;    // ISO datetime
  checkOutTime?: string;   // ISO datetime
  workingHours?: number;   // in minutes
  status: AttendanceStatus;
  isLate: boolean;
  selfieUrl?: string;
  checkInLocation?: GeoLocation;
  checkOutLocation?: GeoLocation;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AttendanceMarkRequest {
  employeeId: string;
  type: 'check_in' | 'check_out';
  latitude: number;
  longitude: number;
  timestamp: string;         // ISO datetime
  selfieBase64: string;      // live selfie
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceId?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  isMockLocation?: boolean;
}

export interface TodayAttendanceSummary {
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  isLate?: boolean;
}

// ============================================================
//  SAS – Leave Types
// ============================================================

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;     // YYYY-MM-DD
  endDate: string;       // YYYY-MM-DD
  reason: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  appliedAt: string;     // ISO datetime
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  totalDays: number;
}

export interface ApplyLeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentBase64?: string;
}

// ============================================================
//  SAS – Holiday Types
// ============================================================

export type HolidayType = 'national' | 'school' | 'festival' | 'vacation';

export interface Holiday {
  id: string;
  name: string;
  date: string;          // YYYY-MM-DD
  endDate?: string;      // For multi-day (vacation)
  type: HolidayType;
  description?: string;
}

// ============================================================
//  SAS – Notification Types
// ============================================================

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;    // ISO datetime
  data?: Record<string, unknown>;
}
