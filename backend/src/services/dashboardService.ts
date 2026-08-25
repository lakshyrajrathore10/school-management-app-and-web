import { User, Notification, Attendance, Leave } from '../models';
import { AttendanceService } from './attendanceService';
import { LeaveStatus } from '../types/enums';

export class DashboardService {
  static async getDashboard(userId: string, schoolId: string) {
    const [user, todayStatus, unreadNotificationsCount]: [any, any, number] = await Promise.all([
      User.findById(userId).populate('school'),
      AttendanceService.getTodayStatus(userId, schoolId),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    if (!user) {
      throw { statusCode: 404, message: 'User details not found.', code: 'NOT_FOUND' };
    }

    // Calculate current month statistics
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthRecords = await Attendance.find({
      userId,
      date: { $regex: `^${currentMonth}` },
    });

    const presentCount = monthRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const lateCount = monthRecords.filter(r => r.isLate).length;
    const absentCount = monthRecords.filter(r => r.status === 'ABSENT').length;

    const leaveCount = await Leave.countDocuments({
      userId,
      status: LeaveStatus.APPROVED,
      startDate: { $regex: `^${currentMonth}` },
    });

    return {
      staff: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email || '',
        designation: user.designation || 'Staff Member',
        department: user.department || 'Academics',
        avatarUrl: user.avatarUrl || undefined,
      },
      school: {
        id: user.school?.id || user.schoolId.toString(),
        name: user.school?.name || '',
        latitude: user.school?.latitude || 0,
        longitude: user.school?.longitude || 0,
        allowedRadiusMeters: user.school?.allowedRadiusMeters || 200,
      },
      today: todayStatus,
      monthlySummary: {
        presentDays: presentCount,
        lateDays: lateCount,
        absentDays: absentCount,
        leavesTaken: leaveCount,
      },
      unreadNotificationsCount,
    };
  }
}
