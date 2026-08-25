// Client & Configuration
export * from './config/apiConfig';
export * from './client/axiosClient';
export * from './client/apiError';

// Endpoint Declarations (all in one file)
export * from './endpoints';

// DTO & Response Types
export * from './types/common.api.types';
export * from './types/auth.api.types';
export * from './types/staff.api.types';
export * from './types/school.api.types';
export * from './types/dashboard.api.types';
export * from './types/attendance.api.types';
export * from './types/leave.api.types';
export * from './types/holiday.api.types';
export * from './types/notification.api.types';
export * from './types/upload.api.types';

// API Services
export * from './services/auth.api';
export * from './services/staff.api';
export * from './services/school.api';
export * from './services/dashboard.api';
export * from './services/attendance.api';
export * from './services/leave.api';
export * from './services/holiday.api';
export * from './services/notification.api';
export * from './services/upload.api';
