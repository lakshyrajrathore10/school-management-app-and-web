import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================
//  SAS – Leave Redux Slice
//  Leave applications fetched from real API
// ============================================================

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export type LeaveType =
  | 'Paid Leave'
  | 'Casual Leave'
  | 'Sick Leave'
  | 'Earned Leave'
  | 'Maternity Leave'
  | 'Emergency Leave'
  | 'Unpaid Leave';

export interface LeaveRecord {
  id: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  remarks?: string;
}

export interface LeaveState {
  leaveList: LeaveRecord[];
}

const initialState: LeaveState = {
  leaveList: [],
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setLeaves: (state, action: PayloadAction<LeaveRecord[]>) => {
      state.leaveList = action.payload;
    },

    /** Apply a new leave — adds it locally with Pending status */
    applyLeave: (
      state,
      action: PayloadAction<{
        id?: string;
        type: LeaveType;
        fromDate: string;
        toDate: string;
        days: number;
        reason: string;
      }>,
    ) => {
      const now = new Date();
      const appliedOn = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const newLeave: LeaveRecord = {
        id: action.payload.id ?? `LV${Date.now()}`,
        type: action.payload.type,
        fromDate: action.payload.fromDate,
        toDate: action.payload.toDate,
        days: action.payload.days,
        reason: action.payload.reason,
        status: 'Pending',
        appliedOn,
      };

      state.leaveList = [newLeave, ...state.leaveList];
    },
  },
});

export const { setLeaves, applyLeave } = leaveSlice.actions;
export default leaveSlice.reducer;
