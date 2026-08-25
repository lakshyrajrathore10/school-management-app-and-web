import { Holiday } from '../models';
import { HolidayType } from '../types/enums';

export class HolidayService {
  private static formatHolidayType(type: HolidayType): 'National' | 'Festival' | 'School' | 'Vacation' {
    const map: Record<HolidayType, 'National' | 'Festival' | 'School' | 'Vacation'> = {
      [HolidayType.NATIONAL]: 'National',
      [HolidayType.FESTIVAL]: 'Festival',
      [HolidayType.SCHOOL]: 'School',
      [HolidayType.VACATION]: 'Vacation',
    };
    return map[type] || 'Festival';
  }

  private static formatReadableDate(startDate: string, endDate?: string | null): string {
    const formatSingle = (dateStr: string) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(d).padStart(2, '0')} ${months[date.getMonth()]} ${y}`;
    };

    if (endDate && endDate !== startDate) {
      const [y1, m1, d1] = startDate.split('-').map(Number);
      const [y2, m2, d2] = endDate.split('-').map(Number);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      if (m1 === m2 && y1 === y2) {
        return `${String(d1).padStart(2, '0')} ${months[m1 - 1]} - ${String(d2).padStart(2, '0')} ${months[m2 - 1]} ${y1}`;
      }
      return `${formatSingle(startDate)} - ${formatSingle(endDate)}`;
    }

    return formatSingle(startDate);
  }

  static async getHolidays(schoolId: string, year?: number) {
    const holidays = await Holiday.find({ schoolId }).sort({ startDate: 1 });

    return holidays.map(h => ({
      id: h.id,
      name: h.name,
      date: this.formatReadableDate(h.startDate, h.endDate),
      day: h.dayName,
      type: this.formatHolidayType(h.type),
      description: h.description || undefined,
      rawStartDate: h.startDate,
      rawEndDate: h.endDate || undefined,
    }));
  }

  static async getDetail(id: string, schoolId: string) {
    const holiday = await Holiday.findOne({ _id: id, schoolId });

    if (!holiday) {
      throw { statusCode: 404, message: 'Holiday details not found.', code: 'NOT_FOUND' };
    }

    return {
      id: holiday.id,
      name: holiday.name,
      date: this.formatReadableDate(holiday.startDate, holiday.endDate),
      day: holiday.dayName,
      type: this.formatHolidayType(holiday.type),
      description: holiday.description || 'Official school holiday.',
      rawStartDate: holiday.startDate,
      rawEndDate: holiday.endDate || undefined,
    };
  }

  // ============================================================
  // ADMIN HOLIDAY CRUD
  // ============================================================

  private static parseHolidayType(typeStr: string): HolidayType {
    const map: Record<string, HolidayType> = {
      National: HolidayType.NATIONAL,
      Festival: HolidayType.FESTIVAL,
      School: HolidayType.SCHOOL,
      Vacation: HolidayType.VACATION,
      national: HolidayType.NATIONAL,
      festival: HolidayType.FESTIVAL,
      school: HolidayType.SCHOOL,
      vacation: HolidayType.VACATION,
      NATIONAL: HolidayType.NATIONAL,
      FESTIVAL: HolidayType.FESTIVAL,
      SCHOOL: HolidayType.SCHOOL,
      VACATION: HolidayType.VACATION,
    };
    return map[typeStr] || HolidayType.FESTIVAL;
  }

  static async createHoliday(
    schoolId: string,
    payload: { name: string; startDate: string; endDate?: string; type: string; description?: string }
  ) {
    const [y, m, d] = payload.startDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dateObj.getDay()];

    const holiday = await Holiday.create({
      schoolId,
      name: payload.name.trim(),
      startDate: payload.startDate,
      endDate: payload.endDate || payload.startDate,
      dayName,
      type: this.parseHolidayType(payload.type),
      description: payload.description?.trim(),
    });

    return {
      id: holiday.id,
      name: holiday.name,
      date: this.formatReadableDate(holiday.startDate, holiday.endDate),
      day: holiday.dayName,
      type: this.formatHolidayType(holiday.type),
      description: holiday.description,
      rawStartDate: holiday.startDate,
      rawEndDate: holiday.endDate,
    };
  }

  static async updateHoliday(
    id: string,
    schoolId: string,
    payload: { name?: string; startDate?: string; endDate?: string; type?: string; description?: string }
  ) {
    const holiday = await Holiday.findOne({ _id: id, schoolId });
    if (!holiday) {
      throw { statusCode: 404, message: 'Holiday not found.', code: 'NOT_FOUND' };
    }

    const updateData: any = {};
    if (payload.name) updateData.name = payload.name.trim();
    if (payload.startDate) {
      updateData.startDate = payload.startDate;
      const [y, m, d] = payload.startDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      updateData.dayName = days[dateObj.getDay()];
    }
    if (payload.endDate) updateData.endDate = payload.endDate;
    if (payload.type) updateData.type = this.parseHolidayType(payload.type);
    if (payload.description !== undefined) updateData.description = payload.description.trim();

    const updated: any = await Holiday.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    return {
      id: updated.id,
      name: updated.name,
      date: this.formatReadableDate(updated.startDate, updated.endDate),
      day: updated.dayName,
      type: this.formatHolidayType(updated.type),
      description: updated.description,
      rawStartDate: updated.startDate,
      rawEndDate: updated.endDate,
    };
  }

  static async deleteHoliday(id: string, schoolId: string) {
    const holiday = await Holiday.findOne({ _id: id, schoolId });
    if (!holiday) {
      throw { statusCode: 404, message: 'Holiday not found.', code: 'NOT_FOUND' };
    }

    await Holiday.findByIdAndDelete(id);
    return { message: 'Holiday deleted successfully.' };
  }
}

