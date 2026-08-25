

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
} as const;

export const STAFF_ENDPOINTS = {
  PROFILE: '/staff/profile',
  CHANGE_PASSWORD: '/staff/change-password',
} as const;

export const SCHOOL_ENDPOINTS = {
  CONFIG: '/schools/config',
} as const;

export const DASHBOARD_ENDPOINTS = {
  METRICS: '/dashboard',
} as const;

export const ATTENDANCE_ENDPOINTS = {
  TODAY: '/attendance/today',
  CHECK_IN: '/attendance/check-in',
  CHECK_OUT: '/attendance/check-out',
  HISTORY: '/attendance/history',
  DETAIL: (id: string) => `/attendance/${id}`,
} as const;

export const LEAVE_ENDPOINTS = {
  LIST: '/leaves',
  APPLY: '/leaves',
  QUOTAS: '/leaves/quotas',
  DETAIL: (id: string) => `/leaves/${id}`,
  CANCEL: (id: string) => `/leaves/${id}/cancel`,
} as const;

export const HOLIDAY_ENDPOINTS = {
  LIST: '/holidays',
  DETAIL: (id: string) => `/holidays/${id}`,
} as const;

export const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  MARK_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  DELETE: (id: string) => `/notifications/${id}`,
} as const;

export const UPLOAD_ENDPOINTS = {
  UPLOAD: '/uploads',
} as const;

export const SALARY_ENDPOINTS = {
  MY_SLIPS: '/salary/my-slips',
  DETAIL: (id: string) => `/salary/detail/${id}`,
} as const;

export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  STAFF: STAFF_ENDPOINTS,
  SCHOOL: SCHOOL_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
  ATTENDANCE: ATTENDANCE_ENDPOINTS,
  LEAVE: LEAVE_ENDPOINTS,
  HOLIDAY: HOLIDAY_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  UPLOAD: UPLOAD_ENDPOINTS,
  SALARY: SALARY_ENDPOINTS,
} as const;

