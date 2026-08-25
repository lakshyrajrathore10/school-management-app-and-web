import { Leave, LeaveQuota, User } from '../models';
import { saveBase64File } from '../middlewares/upload';
import { AuditService } from './auditService';
import { LeaveStatus, LeaveType } from '../types/enums';


export class LeaveService {
  private static parseLeaveType(typeStr: string): LeaveType {
    const map: Record<string, LeaveType> = {
      'Paid Leave': LeaveType.PAID,
      'Casual Leave': LeaveType.CASUAL,
      'Sick Leave': LeaveType.SICK,
      'Earned Leave': LeaveType.EARNED,
      'Maternity Leave': LeaveType.MATERNITY,
      'Emergency Leave': LeaveType.EMERGENCY,
      'Unpaid Leave': LeaveType.UNPAID,
      casual: LeaveType.CASUAL,
      sick: LeaveType.SICK,
      earned: LeaveType.EARNED,
      maternity: LeaveType.MATERNITY,
      paternity: LeaveType.PATERNITY,
      unpaid: LeaveType.UNPAID,
      paid: LeaveType.PAID,
      emergency: LeaveType.EMERGENCY,
    };

    return map[typeStr] || LeaveType.CASUAL;
  }

  private static formatLeaveTypeString(type: LeaveType): string {
    const map: Record<LeaveType, string> = {
      [LeaveType.CASUAL]: 'Casual Leave',
      [LeaveType.SICK]: 'Sick Leave',
      [LeaveType.EARNED]: 'Earned Leave',
      [LeaveType.MATERNITY]: 'Maternity Leave',
      [LeaveType.PATERNITY]: 'Paternity Leave',
      [LeaveType.UNPAID]: 'Unpaid Leave',
      [LeaveType.PAID]: 'Paid Leave',
      [LeaveType.EMERGENCY]: 'Emergency Leave',
    };
    return map[type] || 'Casual Leave';
  }

  private static formatReadableDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d).padStart(2, '0')} ${months[date.getMonth()]} ${y}`;
  }

  static async applyLeave(
    userId: string,
    payload: {
      type: string;
      startDate: string;
      endDate: string;
      reason: string;
      attachmentBase64?: string;
      attachmentUrl?: string;
    }
  ) {
    const leaveTypeEnum = this.parseLeaveType(payload.type);

    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      throw { statusCode: 400, message: 'Invalid start or end date range.', code: 'INVALID_DATES' };
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check overlapping leaves
    const overlap = await Leave.findOne({
      userId,
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      startDate: { $lte: payload.endDate },
      endDate: { $gte: payload.startDate },
    });

    if (overlap) {
      throw {
        statusCode: 409,
        message: 'You already have a pending or approved leave in this date range.',
        code: 'OVERLAPPING_LEAVE',
      };
    }

    // Process attachment file
    let attachmentKey: string | undefined = payload.attachmentUrl;
    if (payload.attachmentBase64) {
      attachmentKey = saveBase64File(payload.attachmentBase64, 'leave_doc');
    }

    const leave = await Leave.create({
      userId,
      leaveType: leaveTypeEnum,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalDays,
      reason: payload.reason,
      attachmentKey,
      status: LeaveStatus.PENDING,
    });

    await AuditService.record({
      actorId: userId,
      action: 'LEAVE_CREATED',
      entity: 'Leave',
      entityId: leave.id,
      metadata: { leaveType: leaveTypeEnum, totalDays, startDate: payload.startDate, endDate: payload.endDate },
    });

    return {
      id: leave.id,
      type: this.formatLeaveTypeString(leave.leaveType),
      fromDate: this.formatReadableDate(leave.startDate),
      toDate: this.formatReadableDate(leave.endDate),
      rawStartDate: leave.startDate,
      rawEndDate: leave.endDate,
      days: leave.totalDays,
      reason: leave.reason,
      status: 'Pending',
      appliedOn: this.formatReadableDate(leave.createdAt.toISOString().split('T')[0]),
      message: 'Leave application submitted successfully.',
    };
  }

  static async getLeaveList(userId: string) {
    const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });

    return leaves.map(l => {
      let statusStr: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' = 'Pending';
      if (l.status === LeaveStatus.APPROVED) statusStr = 'Approved';
      else if (l.status === LeaveStatus.REJECTED) statusStr = 'Rejected';
      else if (l.status === LeaveStatus.CANCELLED) statusStr = 'Cancelled';

      return {
        id: l.id,
        type: this.formatLeaveTypeString(l.leaveType),
        fromDate: this.formatReadableDate(l.startDate),
        toDate: this.formatReadableDate(l.endDate),
        rawStartDate: l.startDate,
        rawEndDate: l.endDate,
        days: l.totalDays,
        reason: l.reason,
        status: statusStr,
        appliedOn: this.formatReadableDate(l.createdAt.toISOString().split('T')[0]),
        remarks: l.reviewComment || undefined,
        attachmentUrl: l.attachmentKey ? `/uploads/${l.attachmentKey}` : undefined,
      };
    });
  }

  static async getQuotas(userId: string) {
    const currentYear = new Date().getFullYear();
    const quotas = await LeaveQuota.find({ userId, year: currentYear });

    if (quotas.length === 0) {
      return [
        { type: 'Casual Leave', totalAllowed: 12, used: 2, remaining: 10 },
        { type: 'Sick Leave', totalAllowed: 10, used: 1, remaining: 9 },
        { type: 'Earned Leave', totalAllowed: 15, used: 3, remaining: 12 },
        { type: 'Paid Leave', totalAllowed: 12, used: 1, remaining: 11 },
      ];
    }

    return quotas.map(q => ({
      type: this.formatLeaveTypeString(q.leaveType),
      totalAllowed: q.totalAllowed,
      used: q.used,
      remaining: q.remaining,
    }));
  }

  static async getDetail(id: string, userId: string) {
    const leave: any = await Leave.findOne({ _id: id, userId }).populate('reviewedBy');

    if (!leave) {
      throw { statusCode: 404, message: 'Leave application not found.', code: 'NOT_FOUND' };
    }

    let statusStr: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' = 'Pending';
    if (leave.status === LeaveStatus.APPROVED) statusStr = 'Approved';
    else if (leave.status === LeaveStatus.REJECTED) statusStr = 'Rejected';
    else if (leave.status === LeaveStatus.CANCELLED) statusStr = 'Cancelled';

    return {
      id: leave.id,
      type: this.formatLeaveTypeString(leave.leaveType),
      fromDate: this.formatReadableDate(leave.startDate),
      toDate: this.formatReadableDate(leave.endDate),
      rawStartDate: leave.startDate,
      rawEndDate: leave.endDate,
      days: leave.totalDays,
      reason: leave.reason,
      status: statusStr,
      appliedOn: this.formatReadableDate(leave.createdAt.toISOString().split('T')[0]),
      remarks: leave.reviewComment || undefined,
      reviewedBy: leave.reviewedBy?.name || undefined,
      attachmentUrl: leave.attachmentKey ? `/uploads/${leave.attachmentKey}` : undefined,
    };
  }

  static async cancelLeave(id: string, userId: string) {
    const leave = await Leave.findOne({ _id: id, userId });

    if (!leave) {
      throw { statusCode: 404, message: 'Leave application not found.', code: 'NOT_FOUND' };
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw { statusCode: 400, message: 'Only pending leave applications can be cancelled.', code: 'INVALID_STATUS' };
    }

    await Leave.findByIdAndUpdate(id, { status: LeaveStatus.CANCELLED });

    return { message: 'Leave application cancelled successfully.' };
  }

  static async approveLeave(id: string, reviewerId: string, comment?: string) {
    const leave = await Leave.findById(id);
    if (!leave) throw { statusCode: 404, message: 'Leave not found.', code: 'NOT_FOUND' };

    const updated = await Leave.findByIdAndUpdate(
      id,
      {
        status: LeaveStatus.APPROVED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewComment: comment || 'Approved',
      },
      { new: true }
    );

    await AuditService.record({
      actorId: reviewerId,
      action: 'LEAVE_APPROVED',
      entity: 'Leave',
      entityId: id,
    });

    return updated;
  }

  static async rejectLeave(id: string, reviewerId: string, comment?: string) {
    const leave = await Leave.findById(id);
    if (!leave) throw { statusCode: 404, message: 'Leave not found.', code: 'NOT_FOUND' };

    const updated = await Leave.findByIdAndUpdate(
      id,
      {
        status: LeaveStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewComment: comment || 'Rejected',
      },
      { new: true }
    );

    await AuditService.record({
      actorId: reviewerId,
      action: 'LEAVE_REJECTED',
      entity: 'Leave',
      entityId: id,
    });

    return updated;
  }

  // ============================================================
  // ADMIN LEAVE MANAGEMENT
  // ============================================================

  static async getAllLeaveRequests(
    schoolId: string,
    options: { status?: string; search?: string; page?: number; limit?: number } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 100;
    const skip = (page - 1) * limit;

    const userQuery: any = { schoolId };
    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      userQuery.$or = [{ name: searchRegex }, { employeeId: searchRegex }];
    }

    const staffMembers = await User.find(userQuery).select('_id');
    const staffIds = staffMembers.map((s: any) => s._id);


    const filter: any = { userId: { $in: staffIds } };
    if (options.status) {
      filter.status = options.status;
    }

    const [leaves, total] = await Promise.all([
      Leave.find(filter)
        .populate('userId', 'name employeeId department designation avatarUrl')
        .populate('reviewedById', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Leave.countDocuments(filter),
    ]);

    const formattedLeaves = leaves.map((l: any) => ({
      id: l.id,
      userId: l.userId?._id?.toString() || l.userId?.id,
      employeeName: l.userId?.name || 'Unknown Staff',
      employeeId: l.userId?.employeeId || '',
      department: l.userId?.department || 'General',
      designation: l.userId?.designation || 'Staff',
      avatarUrl: l.userId?.avatarUrl || undefined,
      type: this.formatLeaveTypeString(l.leaveType),
      rawLeaveType: l.leaveType,
      fromDate: this.formatReadableDate(l.startDate),
      toDate: this.formatReadableDate(l.endDate),
      rawStartDate: l.startDate,
      rawEndDate: l.endDate,
      days: l.totalDays,
      reason: l.reason,
      status: l.status,
      appliedOn: this.formatReadableDate(l.createdAt.toISOString().split('T')[0]),
      remarks: l.reviewComment || undefined,
      reviewedBy: l.reviewedById?.name || undefined,
      attachmentUrl: l.attachmentKey ? `/uploads/${l.attachmentKey}` : undefined,
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      leaves: formattedLeaves,
    };
  }
}

