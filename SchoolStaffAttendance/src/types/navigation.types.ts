import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ============================================================
//  SAS – Navigation Types
//  Pre-typed for all phases (Phase 1 – Phase 14)
// ============================================================

// ── Main Tab Param List ────────────────────────────────────
export type MainTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  LeaveTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

// ── Auth Stack ────────────────────────────────────────────
export type AuthStackParamList = {
  /** Splash / loading screen — checks session */
  Splash: undefined;
  /** Login screen */
  Login: undefined;
};

// ── Main Stack ────────────────────────────────────────────
export type MainStackParamList = {
  /** Bottom Tabs container */
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  
  /** Dashboard home */
  Dashboard: undefined;

  // Phase 4 – Attendance
  /** Attendance home (pre-check permission/GPS status) */
  Attendance: { type: 'check_in' | 'check_out' } | undefined;
  /** Camera screen for live selfie */
  AttendanceCamera: { attendanceType: 'check_in' | 'check_out' };
  /** Preview selfie before submit */
  AttendancePreview: {
    attendanceType: 'check_in' | 'check_out';
    selfieUri: string;
    latitude: number;
    longitude: number;
  };
  /** Attendance success screen */
  AttendanceSuccess: {
    attendanceType: 'check_in' | 'check_out';
    timestamp: string;
    workingHours?: string;
    checkInTime?: string;
    isLate?: boolean;
  };
  /** Attendance failed screen */
  AttendanceFailed: {
    errorCode:
      | 'OUTSIDE_GEOFENCE'
      | 'MOCK_GPS_DETECTED'
      | 'NO_INTERNET'
      | 'GPS_DISABLED'
      | 'LOW_ACCURACY'
      | 'CAMERA_DENIED'
      | 'LOCATION_DENIED'
      | 'ALREADY_CHECKED_IN'
      | 'ALREADY_CHECKED_OUT'
      | 'SERVER_ERROR';
    distanceMeters?: number;
  };

  // Phase 5 – Attendance History
  AttendanceHistory: undefined;
  AttendanceDetail: { recordId: string; date: string };

  // Phase 6 – Leave
  LeaveList: undefined;
  ApplyLeave: undefined;
  LeaveDetail: { leaveId: string };

  // Phase 7 – Holidays
  HolidayList: undefined;
  HolidayDetail: { holidayId: string };

  // Phase 8 – Notifications
  Notifications: undefined;
  NotificationDetail: { notificationId: string };

  // Phase 9 – Profile
  Profile: undefined;
  SalarySlip: undefined;
  AboutApp: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

// ── Root Stack ─────────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainStackParamList> | undefined;
};

// ── Screen Prop Helpers ────────────────────────────────────
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

// ── Global Navigation Type Declaration ─────────────────────
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

