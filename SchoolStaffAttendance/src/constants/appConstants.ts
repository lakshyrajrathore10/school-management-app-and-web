// ============================================================
//  SAS – School Staff Attendance App
//  Application Constants
// ============================================================

/**
 * Geofencing — school campus radius in meters
 * Attendance is only allowed within this radius.
 * This value should match what's configured in the Admin Portal.
 */
export const SCHOOL_GEOFENCE_RADIUS_METERS = 200; // 200 meters default

/**
 * Attendance time window
 * Outside these hours, attendance cannot be marked (UI-level validation)
 */
export const ATTENDANCE_WINDOW = {
  CHECK_IN_START: '06:00',   // 6:00 AM
  CHECK_IN_END: '11:00',     // 11:00 AM
  CHECK_OUT_START: '13:00',  // 1:00 PM
  CHECK_OUT_END: '21:00',    // 9:00 PM
} as const;

/**
 * API request timeout in milliseconds
 */
export const API_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Session / token config
 */
export const SESSION = {
  TOKEN_REFRESH_THRESHOLD_MINUTES: 5,
} as const;

/**
 * MMKV Storage keys — all prefixed with @sas_ for namespacing
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@sas_auth_token',
  REFRESH_TOKEN: '@sas_refresh_token',
  USER_PROFILE: '@sas_user_profile',
  SCHOOL_CONFIG: '@sas_school_config',
  LAST_ATTENDANCE: '@sas_last_attendance',
  APP_SETTINGS: '@sas_app_settings',
  FCM_TOKEN: '@sas_fcm_token',
  ONBOARDING_DONE: '@sas_onboarding_done',
} as const;

/**
 * React Query cache times (milliseconds)
 */
export const QUERY_STALE_TIME = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
} as const;

/**
 * Attendance status values
 */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  ON_LEAVE: 'on_leave',
  HOLIDAY: 'holiday',
  WEEKEND: 'weekend',
} as const;

export type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

/**
 * Leave types
 */
export const LEAVE_TYPE = {
  CASUAL: 'casual',
  SICK: 'sick',
  EARNED: 'earned',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  UNPAID: 'unpaid',
} as const;

export type LeaveType = typeof LEAVE_TYPE[keyof typeof LEAVE_TYPE];

/**
 * Leave request status
 */
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type LeaveStatus = typeof LEAVE_STATUS[keyof typeof LEAVE_STATUS];

/**
 * Notification types
 */
export const NOTIFICATION_TYPE = {
  ATTENDANCE_REMINDER: 'attendance_reminder',
  MEETING_NOTICE: 'meeting_notice',
  HOLIDAY_NOTICE: 'holiday_notice',
  LEAVE_APPROVAL: 'leave_approval',
  LEAVE_REJECTION: 'leave_rejection',
  GENERAL_CIRCULAR: 'general_circular',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];

/**
 * App info
 */
export const APP_INFO = {
  NAME: 'School Staff Attendance',
  VERSION: '1.0.0',
  BUNDLE_ID_ANDROID: 'com.schoolstaffattendance',
  BUNDLE_ID_IOS: 'com.schoolstaffattendance',
  SUPPORT_EMAIL: 'support@sas.school',
} as const;
