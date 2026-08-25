export type Role = 'STAFF' | 'HR' | 'MANAGER' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  employeeId: string;
  role: Role;
  email?: string;
}

// Alias for backward compatibility
export type AdminUser = AuthUser;

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  panNumber?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  employeeId: string;
  designation?: string;
  department?: string;
  role: Role;
  baseSalary?: number;
  bankDetails?: BankDetails;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface EarningsBreakdown {
  baseSalary: number;
  hra: number;
  transportAllowance: number;
  specialAllowance: number;
  bonus: number;
}

export interface DeductionsBreakdown {
  leaveDeduction: number;
  advanceDeduction: number; // Current month salary advance deduction (अग्रिम वेतन)
  latePenalty: number;
  pfDeduction: number;
  taxDeduction: number;
}

export interface SalarySlip {
  id: string;
  userId: string;
  user?: StaffMember;
  month: number;
  year: number;
  baseSalary: number;
  perDaySalary: number;
  totalDaysInMonth: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  holidayDays: number;
  weekendDays: number;
  earnings?: EarningsBreakdown;
  deductionsBreakdown?: DeductionsBreakdown;
  deductions: number;
  allowances: number;
  bonus: number;
  advanceDeduction?: number;
  netSalary: number;
  bankDetailsSnapshot?: BankDetails;
  status: 'GENERATED' | 'PAID' | 'PENDING';
  paymentDate?: string;
  paymentMode?: string;
  transactionRef?: string;
  remarks?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  userId?: string;
  employeeId: string;
  employeeName: string;
  designation?: string;
  department?: string;
  date: string;
  readableDate: string;
  status: string;
  checkInStatus?: 'CHECKED_IN' | 'CHECKED_OUT' | 'NOT_CHECKED_IN' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND' | 'ABSENT';
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: string;
  checkInLat?: number;
  checkInLon?: number;
  checkOutLat?: number;
  checkOutLon?: number;
  checkInSelfieUrl?: string;
  checkOutSelfieUrl?: string;
  isLate?: boolean;
  notes?: string;
  rawCheckInAt?: string;
  rawCheckOutAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedOn: string;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  day?: string;
  rawStartDate: string;
  rawEndDate?: string;
  type: string;
  description?: string;
}

export interface SchoolConfig {
  id: string;
  schoolName: string;
  schoolCode?: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  shiftStartTime: string;
  shiftEndTime: string;
  graceMinutes: number;
  latePenaltyMode?: 'DISABLED' | 'PER_MINUTE' | 'PER_LATE_DAY' | 'HALF_DAY_AFTER_N_LATES';
  latePenaltyPerMinute?: number;
  latePenaltyPerDay?: number;
  lateDaysForHalfDayCut?: number;
  timezone: string;
}
