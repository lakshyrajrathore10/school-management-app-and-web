import { Attendance, School, User, Leave, Holiday } from '../models';
import { validateGeofenceAndGps } from '../utils/geofence';
import { saveBase64File } from '../middlewares/upload';
import { AuditService } from './auditService';
import { AttendanceStatus, LeaveStatus } from '../types/enums';


export class AttendanceService {
  private static getTodayDateString(timezone = 'Asia/Kolkata'): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private static formatWorkingHours(minutes: number): string {
    if (minutes <= 0) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  private static formatReadableDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d).padStart(2, '0')} ${months[date.getMonth()]} ${y}`;
  }

  private static formatDayName(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  private static formatTimeString(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  static async getTodayStatus(userId: string, schoolId: string) {
    const today = this.getTodayDateString();

    const record = await Attendance.findOne({ userId, date: today });

    let todayStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' = 'NOT_CHECKED_IN';
    let statusString = 'Not Marked';

    if (record) {
      if (record.checkInAt && !record.checkOutAt) {
        todayStatus = 'CHECKED_IN';
        statusString = record.isLate ? 'Late' : 'Present';
      } else if (record.checkInAt && record.checkOutAt) {
        todayStatus = 'CHECKED_OUT';
        statusString = 'Checked Out';
      }
    }

    return {
      todayStatus,
      status: statusString,
      date: today,
      checkInTime: record?.checkInAt ? this.formatTimeString(record.checkInAt) : null,
      checkOutTime: record?.checkOutAt ? this.formatTimeString(record.checkOutAt) : null,
      workingHours: record?.workingMinutes ? this.formatWorkingHours(record.workingMinutes) : null,
      workingMinutes: record?.workingMinutes || 0,
      isLate: record?.isLate || false,
      lastLat: record?.checkOutLat || record?.checkInLat || null,
      lastLon: record?.checkOutLon || record?.checkInLon || null,
    };
  }

  static async checkIn(
    userId: string,
    schoolId: string,
    payload: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp?: string | number;
      selfieBase64?: string;
      selfieUrl?: string;
      deviceInfo?: any;
    }
  ) {
    const today = this.getTodayDateString();

    const school = await School.findById(schoolId);
    if (!school) {
      throw { statusCode: 404, message: 'School details not found.', code: 'NOT_FOUND' };
    }

    const isMock = payload.deviceInfo?.isMockLocation || false;
    const geoValidation = validateGeofenceAndGps(
      {
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy,
        timestamp: payload.timestamp,
        isMockLocation: isMock,
      },
      {
        latitude: school.latitude,
        longitude: school.longitude,
        allowedRadiusMeters: school.allowedRadiusMeters,
      }
    );

    if (!geoValidation.isValid) {
      throw {
        statusCode: 400,
        message: geoValidation.errorMessage || 'Geofence validation failed.',
        code: geoValidation.errorCode || 'OUTSIDE_GEOFENCE',
        details: { distanceMeters: geoValidation.distanceMeters },
      };
    }

    const existingRecord = await Attendance.findOne({ userId, date: today });
    if (existingRecord?.checkInAt) {
      throw {
        statusCode: 409,
        message: 'You have already checked in today.',
        code: 'ALREADY_CHECKED_IN',
      };
    }

    const now = new Date();
    const [startH, startM] = school.shiftStartTime.split(':').map(Number);
    const shiftStart = new Date(now);
    shiftStart.setHours(startH, startM + school.graceMinutes, 0, 0);
    const isLate = now > shiftStart;

    let selfieKey: string | undefined = payload.selfieUrl;
    if (payload.selfieBase64) {
      selfieKey = saveBase64File(payload.selfieBase64, 'checkin');
    }

    const record = await Attendance.findOneAndUpdate(
      { userId, date: today },
      {
        $set: {
          userId,
          schoolId,
          date: today,
          checkInAt: now,
          checkInLat: payload.latitude,
          checkInLon: payload.longitude,
          checkInAccuracy: payload.accuracy || 10,
          checkInSelfieKey: selfieKey,
          isLate,
          status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
          isMockLocation: isMock,
          verificationStatus: 'VERIFIED',
        },
      },
      { upsert: true, new: true }
    );

    await AuditService.record({
      actorId: userId,
      action: 'CHECK_IN',
      entity: 'Attendance',
      entityId: record.id,
      metadata: {
        latitude: payload.latitude,
        longitude: payload.longitude,
        isLate,
        distanceMeters: geoValidation.distanceMeters,
      },
    });

    return {
      id: record.id,
      date: today,
      checkInTime: this.formatTimeString(now),
      status: isLate ? 'Late' : 'Present',
      isLate,
      distanceMeters: geoValidation.distanceMeters,
      message: 'Check-in successful.',
    };
  }

  static async checkOut(
    userId: string,
    schoolId: string,
    payload: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp?: string | number;
      selfieBase64?: string;
      selfieUrl?: string;
      deviceInfo?: any;
    }
  ) {
    const today = this.getTodayDateString();

    const school = await School.findById(schoolId);
    if (!school) {
      throw { statusCode: 404, message: 'School details not found.', code: 'NOT_FOUND' };
    }

    const isMock = payload.deviceInfo?.isMockLocation || false;
    const geoValidation = validateGeofenceAndGps(
      {
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy,
        timestamp: payload.timestamp,
        isMockLocation: isMock,
      },
      {
        latitude: school.latitude,
        longitude: school.longitude,
        allowedRadiusMeters: school.allowedRadiusMeters,
      }
    );

    if (!geoValidation.isValid) {
      throw {
        statusCode: 400,
        message: geoValidation.errorMessage || 'Geofence validation failed.',
        code: geoValidation.errorCode || 'OUTSIDE_GEOFENCE',
        details: { distanceMeters: geoValidation.distanceMeters },
      };
    }

    const record = await Attendance.findOne({ userId, date: today });

    if (!record || !record.checkInAt) {
      throw {
        statusCode: 400,
        message: 'You must check in before checking out.',
        code: 'NOT_CHECKED_IN',
      };
    }

    if (record.checkOutAt) {
      throw {
        statusCode: 409,
        message: 'You have already completed attendance for today.',
        code: 'ALREADY_CHECKED_OUT',
      };
    }

    let selfieKey: string | undefined = payload.selfieUrl;
    if (payload.selfieBase64) {
      selfieKey = saveBase64File(payload.selfieBase64, 'checkout');
    }

    const now = new Date();
    const diffMs = now.getTime() - record.checkInAt.getTime();
    const workingMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    let updatedStatus: AttendanceStatus = record.status;
    if (workingMinutes < 240) {
      updatedStatus = AttendanceStatus.HALF_DAY;
    }

    const updated = await Attendance.findByIdAndUpdate(
      record._id,
      {
        $set: {
          checkOutAt: now,
          checkOutLat: payload.latitude,
          checkOutLon: payload.longitude,
          checkOutAccuracy: payload.accuracy || 10,
          checkOutSelfieKey: selfieKey,
          workingMinutes,
          status: updatedStatus,
        },
      },
      { new: true }
    );

    if (!updated) {
      throw { statusCode: 500, message: 'Failed to update attendance record.', code: 'SERVER_ERROR' };
    }

    await AuditService.record({
      actorId: userId,
      action: 'CHECK_OUT',
      entity: 'Attendance',
      entityId: updated.id,
      metadata: {
        workingMinutes,
        workingHours: this.formatWorkingHours(workingMinutes),
      },
    });

    return {
      id: updated.id,
      date: today,
      checkInTime: this.formatTimeString(record.checkInAt),
      checkOutTime: this.formatTimeString(now),
      workingHours: this.formatWorkingHours(workingMinutes),
      status: updatedStatus === AttendanceStatus.HALF_DAY ? 'Half Day' : record.isLate ? 'Late' : 'Present',
      message: 'Check-out successful.',
    };
  }

  static async getHistory(userId: string, query: { page?: number; limit?: number; from?: string; to?: string; month?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { userId };

    if (query.from && query.to) {
      filter.date = { $gte: query.from, $lte: query.to };
    } else if (query.month) {
      filter.date = { $regex: `^${query.month}` };
    }

    const [items, total] = await Promise.all([
      Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Attendance.countDocuments(filter),
    ]);

    const formattedItems = items.map((item: any) => {
      let statusStr: 'Present' | 'Late' | 'Absent' | 'Half Day' = 'Present';
      if (item.status === AttendanceStatus.LATE) statusStr = 'Late';
      else if (item.status === AttendanceStatus.ABSENT) statusStr = 'Absent';
      else if (item.status === AttendanceStatus.HALF_DAY) statusStr = 'Half Day';

      return {
        id: item.id,
        date: this.formatReadableDate(item.date),
        rawDate: item.date,
        day: this.formatDayName(item.date),
        checkIn: item.checkInAt ? this.formatTimeString(item.checkInAt) : '--',
        checkOut: item.checkOutAt ? this.formatTimeString(item.checkOutAt) : '--',
        workingHours: item.workingMinutes ? this.formatWorkingHours(item.workingMinutes) : '--',
        status: statusStr,
        isLate: item.isLate,
      };
    });

    return {
      items: formattedItems,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }

  static async getDetail(id: string, userId: string) {
    const record: any = await Attendance.findOne({ _id: id, userId }).populate('school').populate('user');

    if (!record) {
      throw { statusCode: 404, message: 'Attendance record not found.', code: 'NOT_FOUND' };
    }

    return {
      id: record.id,
      employeeId: record.user?.employeeId || '',
      employeeName: record.user?.name || '',
      schoolName: record.school?.name || '',
      date: this.formatReadableDate(record.date),
      rawDate: record.date,
      day: this.formatDayName(record.date),
      checkInTime: record.checkInAt ? this.formatTimeString(record.checkInAt) : '--',
      checkOutTime: record.checkOutAt ? this.formatTimeString(record.checkOutAt) : '--',
      workingHours: record.workingMinutes ? this.formatWorkingHours(record.workingMinutes) : '--',
      status: record.status,
      isLate: record.isLate,
      checkInLocation: record.checkInLat ? { latitude: record.checkInLat, longitude: record.checkInLon, accuracy: record.checkInAccuracy } : null,
      checkOutLocation: record.checkOutLat ? { latitude: record.checkOutLat, longitude: record.checkOutLon, accuracy: record.checkOutAccuracy } : null,
      checkInSelfieUrl: record.checkInSelfieKey ? `/uploads/${record.checkInSelfieKey}` : null,
      checkOutSelfieUrl: record.checkOutSelfieKey ? `/uploads/${record.checkOutSelfieKey}` : null,
      verificationStatus: record.verificationStatus,
    };
  }

  // ============================================================
  // ADMIN ATTENDANCE MANAGEMENT & OVERRIDES
  // ============================================================

  static async getAllStaffAttendance(
    schoolId: string,
    options: { date?: string; department?: string; status?: string; search?: string; page?: number; limit?: number } = {}
  ) {
    const filterDate = options.date || this.getTodayDateString();
    const isToday = filterDate === this.getTodayDateString();

    // 1. Fetch matching active staff members
    let userQuery: any = { schoolId, isActive: true };
    if (options.department) {
      userQuery.department = options.department;
    }
    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      userQuery.$or = [
        { name: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
      ];
    }

    const staffMembers = await User.find(userQuery).select('_id employeeId name designation department avatarUrl email phone');
    const staffIds = staffMembers.map((s: any) => s._id);

    // 2. Query existing Attendance records for filterDate
    const attendanceRecords = await Attendance.find({
      schoolId,
      date: filterDate,
      userId: { $in: staffIds },
    });

    const attendanceMap: Record<string, any> = {};
    attendanceRecords.forEach((att: any) => {
      if (att.userId) {
        attendanceMap[att.userId.toString()] = att;
      }
    });

    // 3. Query Approved Leaves covering filterDate
    const leaves = await Leave.find({
      userId: { $in: staffIds },
      status: LeaveStatus.APPROVED,
    });

    // 4. Query Holidays for school
    const holidays = await Holiday.find({ schoolId });

    const isSchoolHoliday = holidays.some((h: any) => {
      const start = h.startDate;
      const end = h.endDate || h.startDate;
      return filterDate >= start && filterDate <= end;
    });

    const dateObj = new Date(filterDate + 'T00:00:00');
    const isSunday = dateObj.getDay() === 0;

    let presentCount = 0;
    let checkedInCount = 0;
    let checkedOutCount = 0;
    let notCheckedInCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let onLeaveCount = 0;

    const allRecords = staffMembers.map((staff: any) => {
      const staffIdStr = staff._id.toString();
      const att = attendanceMap[staffIdStr];

      const matchingLeave = leaves.find((l: any) => {
        return l.userId.toString() === staffIdStr && filterDate >= l.startDate && filterDate <= l.endDate;
      });

      let status = 'NOT_CHECKED_IN';
      let checkInStatus = 'NOT_CHECKED_IN';
      let checkInTime = null;
      let checkOutTime = null;
      let rawCheckInAt = null;
      let rawCheckOutAt = null;
      let workingHours = '0h 0m';
      let isLate = false;
      let checkInLat = null;
      let checkInLon = null;
      let checkOutLat = null;
      let checkOutLon = null;
      let checkInSelfieUrl = null;
      let checkOutSelfieUrl = null;
      let verificationStatus = 'NOT_CHECKED_IN';
      let notes = null;
      let recordId = att ? att.id || att._id.toString() : `temp_${staffIdStr}`;

      if (att) {
        recordId = att.id || att._id.toString();
        status = att.status;
        isLate = att.isLate;
        checkInTime = att.checkInAt ? this.formatTimeString(att.checkInAt) : null;
        checkOutTime = att.checkOutAt ? this.formatTimeString(att.checkOutAt) : null;
        rawCheckInAt = att.checkInAt ? att.checkInAt.toISOString() : null;
        rawCheckOutAt = att.checkOutAt ? att.checkOutAt.toISOString() : null;
        workingHours = att.workingMinutes ? this.formatWorkingHours(att.workingMinutes) : '0h 0m';
        checkInLat = att.checkInLat || null;
        checkInLon = att.checkInLon || null;
        checkOutLat = att.checkOutLat || null;
        checkOutLon = att.checkOutLon || null;
        checkInSelfieUrl = att.checkInSelfieKey ? `/uploads/${att.checkInSelfieKey}` : null;
        checkOutSelfieUrl = att.checkOutSelfieKey ? `/uploads/${att.checkOutSelfieKey}` : null;
        verificationStatus = att.verificationStatus;
        notes = att.notes || null;

        if (att.checkOutAt) {
          checkInStatus = 'CHECKED_OUT';
          checkedOutCount++;
          presentCount++;
        } else if (att.checkInAt) {
          checkInStatus = 'CHECKED_IN';
          checkedInCount++;
          presentCount++;
        } else {
          checkInStatus = 'NOT_CHECKED_IN';
          notCheckedInCount++;
        }

        if (att.isLate) {
          lateCount++;
        }
      } else if (matchingLeave) {
        status = 'ON_LEAVE';
        checkInStatus = 'ON_LEAVE';
        verificationStatus = 'APPROVED_LEAVE';
        notes = `${matchingLeave.leaveType} Leave`;
        onLeaveCount++;
      } else if (isSchoolHoliday) {
        status = 'HOLIDAY';
        checkInStatus = 'HOLIDAY';
        notes = 'School Holiday';
      } else if (isSunday) {
        status = 'WEEKEND';
        checkInStatus = 'WEEKEND';
        notes = 'Sunday';
      } else if (isToday) {
        status = 'NOT_CHECKED_IN';
        checkInStatus = 'NOT_CHECKED_IN';
        notCheckedInCount++;
      } else {
        status = 'ABSENT';
        checkInStatus = 'ABSENT';
        absentCount++;
      }

      return {
        id: recordId,
        userId: staffIdStr,
        employeeId: staff.employeeId,
        employeeName: staff.name,
        department: staff.department || 'General',
        designation: staff.designation || 'Staff',
        avatarUrl: staff.avatarUrl || undefined,
        date: filterDate,
        readableDate: this.formatReadableDate(filterDate),
        checkInStatus,
        checkInTime,
        checkOutTime,
        rawCheckInAt,
        rawCheckOutAt,
        workingHours,
        status,
        isLate,
        checkInLat,
        checkInLon,
        checkOutLat,
        checkOutLon,
        checkInSelfieUrl,
        checkOutSelfieUrl,
        verificationStatus,
        notes,
      };
    });

    let filteredRecords = allRecords;
    if (options.status) {
      const s = options.status.toUpperCase();
      if (s === 'CHECKED_IN') {
        filteredRecords = allRecords.filter(r => r.checkInStatus === 'CHECKED_IN');
      } else if (s === 'CHECKED_OUT') {
        filteredRecords = allRecords.filter(r => r.checkInStatus === 'CHECKED_OUT');
      } else if (s === 'NOT_CHECKED_IN') {
        filteredRecords = allRecords.filter(r => r.checkInStatus === 'NOT_CHECKED_IN');
      } else if (s === 'LATE') {
        filteredRecords = allRecords.filter(r => r.isLate);
      } else if (s === 'PRESENT') {
        filteredRecords = allRecords.filter(r => r.checkInStatus === 'CHECKED_IN' || r.checkInStatus === 'CHECKED_OUT' || r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'HALF_DAY');
      } else if (s === 'ABSENT') {
        filteredRecords = allRecords.filter(r => r.status === 'ABSENT' || r.checkInStatus === 'ABSENT');
      } else if (s === 'ON_LEAVE') {
        filteredRecords = allRecords.filter(r => r.status === 'ON_LEAVE');
      } else {
        filteredRecords = allRecords.filter(r => r.status === s || r.checkInStatus === s);
      }
    }

    const page = options.page || 1;
    const limit = options.limit || 200;
    const skip = (page - 1) * limit;

    const total = filteredRecords.length;
    const paginatedRecords = filteredRecords.slice(skip, skip + limit);

    return {
      date: filterDate,
      summary: {
        totalStaff: staffMembers.length,
        presentCount,
        checkedInCount,
        checkedOutCount,
        notCheckedInCount,
        lateCount,
        absentCount,
        onLeaveCount,
      },
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      records: paginatedRecords,
    };
  }

  static async overrideAttendanceByAdmin(
    adminUserId: string,
    attendanceId: string,
    payload: {
      userId?: string;
      date?: string;
      status?: AttendanceStatus;
      checkInAt?: string;
      checkOutAt?: string;
      notes?: string;
      isLate?: boolean;
    }
  ) {
    let record: any = null;
    if (attendanceId && !attendanceId.startsWith('temp_')) {
      record = await Attendance.findById(attendanceId);
    }

    if (!record && payload.userId && payload.date) {
      const user = await User.findById(payload.userId);
      if (user) {
        record = await Attendance.findOne({ userId: payload.userId, date: payload.date });
        if (!record) {
          record = await Attendance.create({
            userId: payload.userId,
            schoolId: user.schoolId,
            date: payload.date,
            status: payload.status || AttendanceStatus.PRESENT,
          });
        }
      }
    }

    if (!record) {
      throw { statusCode: 404, message: 'Attendance record or user not found.', code: 'NOT_FOUND' };
    }

    const updateData: any = {};
    if (payload.status) updateData.status = payload.status;
    if (payload.notes) updateData.notes = payload.notes;
    if (payload.isLate !== undefined) updateData.isLate = payload.isLate;

    if (payload.checkInAt) {
      updateData.checkInAt = new Date(payload.checkInAt);
    }
    if (payload.checkOutAt) {
      updateData.checkOutAt = new Date(payload.checkOutAt);
    }

    if (updateData.checkInAt && updateData.checkOutAt) {
      const diffMs = updateData.checkOutAt.getTime() - updateData.checkInAt.getTime();
      updateData.workingMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    }

    updateData.verificationStatus = 'MANUALLY_OVERRIDDEN';

    const updated: any = await Attendance.findByIdAndUpdate(
      record._id,
      { $set: updateData },
      { new: true }
    ).populate('userId', 'name employeeId');

    await AuditService.record({
      actorId: adminUserId,
      action: 'ATTENDANCE_OVERRIDDEN_BY_ADMIN',
      entity: 'Attendance',
      entityId: record._id.toString(),
      metadata: payload,
    });

    return {
      id: updated.id,
      employeeName: updated.userId?.name,
      employeeId: updated.userId?.employeeId,
      date: updated.date,
      status: updated.status,
      checkInTime: updated.checkInAt ? this.formatTimeString(updated.checkInAt) : null,
      checkOutTime: updated.checkOutAt ? this.formatTimeString(updated.checkOutAt) : null,
      workingHours: updated.workingMinutes ? this.formatWorkingHours(updated.workingMinutes) : '0h 0m',
      verificationStatus: updated.verificationStatus,
      notes: updated.notes,
    };
  }
}

