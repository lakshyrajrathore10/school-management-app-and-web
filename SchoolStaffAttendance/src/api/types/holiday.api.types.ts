export interface HolidayApiItem {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'National' | 'Festival' | 'School' | 'Vacation';
  description?: string;
  rawStartDate: string;
  rawEndDate?: string;
}
