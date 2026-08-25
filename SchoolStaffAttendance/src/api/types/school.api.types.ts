export interface SchoolConfigApiResponse {
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  shiftStartTime: string;
  shiftEndTime: string;
  graceMinutes: number;
  monthlyPaidLeaves?: number;
  timezone: string;
}
