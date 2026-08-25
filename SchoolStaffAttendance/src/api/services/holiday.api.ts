import axiosClient from '../client/axiosClient';
import { HOLIDAY_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types/common.api.types';
import { HolidayApiItem } from '../types/holiday.api.types';

export const holidayApi = {
  getHolidays: async (year?: number): Promise<HolidayApiItem[]> => {
    const response = await axiosClient.get<ApiResponse<HolidayApiItem[]>>(HOLIDAY_ENDPOINTS.LIST, {
      params: { year },
    });
    return response.data.data;
  },

  getDetail: async (id: string): Promise<HolidayApiItem> => {
    const response = await axiosClient.get<ApiResponse<HolidayApiItem>>(
      HOLIDAY_ENDPOINTS.DETAIL(id)
    );
    return response.data.data;
  },
};
