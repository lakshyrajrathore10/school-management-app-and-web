import { holidayApi } from '../api/services/holiday.api';
export * from '../api/types/holiday.api.types';

export const holidayService = {
  fetchHolidays: holidayApi.getHolidays,
  fetchDetail: holidayApi.getDetail,
};
