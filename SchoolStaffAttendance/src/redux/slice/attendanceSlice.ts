import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TodayStatusApiResponse } from '../../api/types/attendance.api.types';

function parseTimeStringToMs(dateStr: string, timeStr: string): number | null {
  try {
    if (!dateStr || !timeStr) return null;
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    if (!cleanDate) return null;
    const parts = cleanDate.split('-');
    if (parts.length < 3) return null;
    const yearStr = parts[0];
    const monthStr = parts[1];
    const dayStr = parts[2];
    if (!yearStr || !monthStr || !dayStr) return null;

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (!match || !match[1] || !match[2]) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];

    if (ampm) {
      const upper = ampm.toUpperCase();
      if (upper === 'PM' && hours < 12) hours += 12;
      if (upper === 'AM' && hours === 12) hours = 0;
    }

    const d = new Date(year, month, day, hours, minutes, 0, 0);
    return d.getTime();
  } catch {
    return null;
  }
}

// ============================================================
//  SAS – Attendance Redux Slice
//  Daily state machine: NOT_CHECKED_IN → CHECKED_IN → CHECKED_OUT
// ============================================================

export type DailyAttendanceStatus =
  | 'NOT_CHECKED_IN'
  | 'CHECKED_IN'
  | 'CHECKED_OUT';

export type LegacyAttendanceStatus =
  | 'Not Marked'
  | 'Present'
  | 'Late'
  | 'Checked Out'
  | 'Half Day';

export interface AttendanceRecordItem {
  id: string;
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  workingHours: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half Day';
  isLate: boolean;
}

export interface AttendanceState {
  // Daily state machine
  todayStatus: DailyAttendanceStatus;

  // Legacy compat (used in dashboard badge)
  status: LegacyAttendanceStatus;

  // Timestamps & times
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInTimestamp: number | null;
  checkOutTimestamp: number | null;
  workingMinutes: number;
  workingHoursString: string | null;

  // Late flag
  isLateCheckIn: boolean;

  // Location state (set when check-in/out happens)
  lastLat: number | null;
  lastLon: number | null;
  lastAccuracy: number | null;

  // Pre-flight geofence state (updated on AttendanceHome mount)
  isInsideGeofence: boolean;
  geofenceDistanceMeters: number;

  // History
  history: AttendanceRecordItem[];
}

const initialState: AttendanceState = {
  todayStatus: 'NOT_CHECKED_IN',
  status: 'Not Marked',
  checkInTime: null,
  checkOutTime: null,
  checkInTimestamp: null,
  checkOutTimestamp: null,
  workingMinutes: 0,
  workingHoursString: null,
  isLateCheckIn: false,
  lastLat: null,
  lastLon: null,
  lastAccuracy: null,
  isInsideGeofence: false,
  geofenceDistanceMeters: 0,
  history: [],
};

// ─────────────────────────────────────────────────────────────
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // ── History Sync ─────────────────────────────────────────
    setHistory: (state, action: PayloadAction<AttendanceRecordItem[]>) => {
      state.history = action.payload;
    },

    // ── Geofence & Location Update (from AttendanceHome) ────
    setGeofenceStatus: (
      state,
      action: PayloadAction<{ isInside: boolean; distanceMeters: number }>,
    ) => {
      state.isInsideGeofence = action.payload.isInside;
      state.geofenceDistanceMeters = action.payload.distanceMeters;
    },

    // ── Check In ─────────────────────────────────────────────
    markCheckIn: (
      state,
      action: PayloadAction<{
        timeString: string;
        dateString: string;
        dayString: string;
        latitude: number;
        longitude: number;
        accuracy: number;
        isLate: boolean;
      }>,
    ) => {
      const now = Date.now();
      const { timeString, dateString, dayString, latitude, longitude, accuracy, isLate } = action.payload;

      state.todayStatus = 'CHECKED_IN';
      state.status = isLate ? 'Late' : 'Present';
      state.checkInTime = timeString;
      state.checkInTimestamp = now;
      state.checkOutTime = null;
      state.checkOutTimestamp = null;
      state.workingMinutes = 0;
      state.workingHoursString = null;
      state.isLateCheckIn = isLate;
      state.lastLat = latitude;
      state.lastLon = longitude;
      state.lastAccuracy = accuracy;

      // Add today's record to history
      const newRecord: AttendanceRecordItem = {
        id: String(now),
        date: dateString,
        day: dayString,
        checkIn: timeString,
        checkOut: '--',
        workingHours: '--',
        status: isLate ? 'Late' : 'Present',
        isLate,
      };
      state.history = [
        newRecord,
        ...state.history.filter(h => h.date !== dateString),
      ];
    },

    // ── Check Out ────────────────────────────────────────────
    markCheckOut: (
      state,
      action: PayloadAction<{
        timeString: string;
        dateString: string;
        workingHoursString: string;
        latitude: number;
        longitude: number;
        accuracy: number;
      }>,
    ) => {
      const now = Date.now();
      const { timeString, dateString, workingHoursString, latitude, longitude, accuracy } = action.payload;

      state.todayStatus = 'CHECKED_OUT';
      state.status = 'Checked Out';
      state.checkOutTime = timeString;
      state.checkOutTimestamp = now;
      state.workingHoursString = workingHoursString;
      state.lastLat = latitude;
      state.lastLon = longitude;
      state.lastAccuracy = accuracy;

      // Update today's history record
      state.history = state.history.map(item => {
        if (item.date === dateString) {
          return {
            ...item,
            checkOut: timeString,
            workingHours: workingHoursString,
          };
        }
        return item;
      });
    },

    // ── Sync Today's Status from Backend API ────────────────
    syncTodayStatus: (state, action: PayloadAction<TodayStatusApiResponse>) => {
      const payload = action.payload;
      if (!payload) return;

      state.todayStatus = payload.todayStatus || 'NOT_CHECKED_IN';
      state.status = (payload.status as LegacyAttendanceStatus) || 'Not Marked';
      state.checkInTime = payload.checkInTime || null;
      state.checkOutTime = payload.checkOutTime || null;
      state.workingMinutes = payload.workingMinutes || 0;
      state.workingHoursString = payload.workingHours || null;
      state.isLateCheckIn = payload.isLate || false;

      if (payload.lastLat) state.lastLat = payload.lastLat;
      if (payload.lastLon) state.lastLon = payload.lastLon;

      if (payload.date && payload.checkInTime) {
        const ts = parseTimeStringToMs(payload.date, payload.checkInTime);
        if (ts) state.checkInTimestamp = ts;
      } else if (!payload.checkInTime) {
        state.checkInTimestamp = null;
      }

      if (payload.date && payload.checkOutTime) {
        const ts = parseTimeStringToMs(payload.date, payload.checkOutTime);
        if (ts) state.checkOutTimestamp = ts;
      } else if (!payload.checkOutTime) {
        state.checkOutTimestamp = null;
      }
    },

    // ── Reset (new day) ──────────────────────────────────────
    resetAttendance: state => {
      state.todayStatus = 'NOT_CHECKED_IN';
      state.status = 'Not Marked';
      state.checkInTime = null;
      state.checkOutTime = null;
      state.checkInTimestamp = null;
      state.checkOutTimestamp = null;
      state.workingMinutes = 0;
      state.workingHoursString = null;
      state.isLateCheckIn = false;
      state.lastLat = null;
      state.lastLon = null;
      state.lastAccuracy = null;
    },
  },
});

export const {
  setHistory,
  setGeofenceStatus,
  markCheckIn,
  markCheckOut,
  syncTodayStatus,
  resetAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
