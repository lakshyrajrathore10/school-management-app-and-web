export interface LeaveApiItem {
  id: string;
  type: string;
  fromDate: string;
  toDate: string;
  rawStartDate: string;
  rawEndDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedOn: string;
  remarks?: string;
  attachmentUrl?: string;
}

export interface ApplyLeaveApiRequest {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  attachmentBase64?: string;
  attachmentUrl?: string;
}

export interface LeaveQuotaApiItem {
  type: string;
  totalAllowed: number;
  used: number;
  remaining: number;
}
