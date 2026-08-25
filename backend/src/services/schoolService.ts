import { School } from '../models';

export class SchoolService {
  static async getSchoolConfig(schoolId: string) {
    const school = await School.findById(schoolId);

    if (!school) {
      throw { statusCode: 404, message: 'School configuration not found.', code: 'NOT_FOUND' };
    }

    return {
      schoolId: school.id,
      schoolName: school.name,
      schoolCode: school.code,
      latitude: school.latitude,
      longitude: school.longitude,
      allowedRadiusMeters: school.allowedRadiusMeters,
      shiftStartTime: school.shiftStartTime,
      shiftEndTime: school.shiftEndTime,
      graceMinutes: school.graceMinutes,
      monthlyPaidLeaves: school.monthlyPaidLeaves ?? 2,
      latePenaltyMode: school.latePenaltyMode ?? 'PER_MINUTE',
      latePenaltyPerMinute: school.latePenaltyPerMinute ?? 5,
      latePenaltyPerDay: school.latePenaltyPerDay ?? 100,
      lateDaysForHalfDayCut: school.lateDaysForHalfDayCut ?? 3,
      timezone: school.timezone,
    };
  }

  static async updateSchoolConfig(
    schoolId: string,
    data: {
      schoolName?: string;
      latitude?: number;
      longitude?: number;
      allowedRadiusMeters?: number;
      shiftStartTime?: string;
      shiftEndTime?: string;
      graceMinutes?: number;
      monthlyPaidLeaves?: number;
      latePenaltyMode?: 'DISABLED' | 'PER_MINUTE' | 'PER_LATE_DAY' | 'HALF_DAY_AFTER_N_LATES';
      latePenaltyPerMinute?: number;
      latePenaltyPerDay?: number;
      lateDaysForHalfDayCut?: number;
      timezone?: string;
    }
  ) {
    const updateData: any = {};
    if (data.schoolName) updateData.name = data.schoolName;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.allowedRadiusMeters !== undefined) updateData.allowedRadiusMeters = data.allowedRadiusMeters;
    if (data.shiftStartTime) updateData.shiftStartTime = data.shiftStartTime;
    if (data.shiftEndTime) updateData.shiftEndTime = data.shiftEndTime;
    if (data.graceMinutes !== undefined) updateData.graceMinutes = data.graceMinutes;
    if (data.monthlyPaidLeaves !== undefined) updateData.monthlyPaidLeaves = data.monthlyPaidLeaves;
    if (data.latePenaltyMode !== undefined) updateData.latePenaltyMode = data.latePenaltyMode;
    if (data.latePenaltyPerMinute !== undefined) updateData.latePenaltyPerMinute = data.latePenaltyPerMinute;
    if (data.latePenaltyPerDay !== undefined) updateData.latePenaltyPerDay = data.latePenaltyPerDay;
    if (data.lateDaysForHalfDayCut !== undefined) updateData.lateDaysForHalfDayCut = data.lateDaysForHalfDayCut;
    if (data.timezone) updateData.timezone = data.timezone;

    const school = await School.findByIdAndUpdate(schoolId, { $set: updateData }, { new: true });

    if (!school) {
      throw { statusCode: 404, message: 'School not found.', code: 'NOT_FOUND' };
    }

    return {
      schoolId: school.id,
      schoolName: school.name,
      schoolCode: school.code,
      latitude: school.latitude,
      longitude: school.longitude,
      allowedRadiusMeters: school.allowedRadiusMeters,
      shiftStartTime: school.shiftStartTime,
      shiftEndTime: school.shiftEndTime,
      graceMinutes: school.graceMinutes,
      monthlyPaidLeaves: school.monthlyPaidLeaves ?? 2,
      latePenaltyMode: school.latePenaltyMode ?? 'PER_MINUTE',
      latePenaltyPerMinute: school.latePenaltyPerMinute ?? 5,
      latePenaltyPerDay: school.latePenaltyPerDay ?? 100,
      lateDaysForHalfDayCut: school.lateDaysForHalfDayCut ?? 3,
      timezone: school.timezone,
    };
  }
}

