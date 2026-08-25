// ============================================================
//  SAS – User / Staff Profile Types
// ============================================================

export interface StaffProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  schoolName: string;
  schoolId?: string;
  avatarUrl?: string;
}
