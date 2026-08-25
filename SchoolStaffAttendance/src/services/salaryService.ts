import axiosClient from '../api/client/axiosClient';
import { SALARY_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../api/types/common.api.types';

export interface SalarySlipItem {
  id: string;
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
  deductions: number;
  allowances: number;
  bonus: number;
  netSalary: number;
  status: 'GENERATED' | 'PAID' | 'PENDING';
  paymentDate?: string;
  paymentMode?: string;
  transactionRef?: string;
  remarks?: string;
  createdAt?: string;
  school?: {
    name: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  user?: {
    name: string;
    employeeId: string;
    designation?: string;
    department?: string;
    avatarUrl?: string;
  };
}

export const salaryService = {
  getMySalarySlips: async (): Promise<SalarySlipItem[]> => {
    const response = await axiosClient.get<ApiResponse<SalarySlipItem[]>>(SALARY_ENDPOINTS.MY_SLIPS);
    return response.data.data;
  },

  getSalarySlipById: async (id: string): Promise<SalarySlipItem> => {
    const response = await axiosClient.get<ApiResponse<SalarySlipItem>>(SALARY_ENDPOINTS.DETAIL(id));
    return response.data.data;
  },
};
