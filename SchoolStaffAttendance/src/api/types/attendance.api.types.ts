export interface TodayStatusApiResponse {
  todayStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT';
  status: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: string | null;
  workingMinutes: number;
  isLate: boolean;
  lastLat: number | null;
  lastLon: number | null;
}

export interface CheckInApiRequest {
  employeeId?: string;
  type?: 'check_in' | 'check_out';
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  selfieBase64?: string;
  selfieUrl?: string;
  deviceInfo?: {
    platform?: string;
    appVersion?: string;
    isMockLocation?: boolean;
  };
}

export interface CheckInApiResponse {
  id: string;
  date: string;
  checkInTime: string;
  status: string;
  isLate: boolean;
  distanceMeters?: number;
  message: string;
}

export interface CheckOutApiRequest {
  employeeId?: string;
  type?: 'check_in' | 'check_out';
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  selfieBase64?: string;
  selfieUrl?: string;
  deviceInfo?: {
    platform?: string;
    appVersion?: string;
    isMockLocation?: boolean;
  };
}

export interface CheckOutApiResponse {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workingHours: string;
  status: string;
  message: string;
}

export interface AttendanceHistoryApiItem {
  id: string;
  date: string;
  rawDate: string;
  day: string;
  checkIn: string;
  checkOut: string;
  workingHours: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day';
  isLate: boolean;
}

export interface AttendanceDetailApiResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  schoolName: string;
  date: string;
  rawDate: string;
  day: string;
  checkInTime: string;
  checkOutTime: string;
  workingHours: string;
  status: string;
  isLate: boolean;
  checkInLocation?: { latitude: number; longitude: number; accuracy?: number } | null;
  checkOutLocation?: { latitude: number; longitude: number; accuracy?: number } | null;
  checkInSelfieUrl?: string | null;
  checkOutSelfieUrl?: string | null;
  verificationStatus: string;
}
