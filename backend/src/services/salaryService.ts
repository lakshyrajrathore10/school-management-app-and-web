import { User, Attendance, Leave, Holiday, SalarySlip, SalarySlipStatus, SalaryAdvance, School } from '../models';
import { AttendanceStatus, LeaveType, LeaveStatus } from '../types/enums';
import { AuditService } from './auditService';

export class SalaryService {
  /**
   * Calculates monthly attendance breakdown, daily calendar status, per-day salary rate,
   * unpaid leave deductions, recorded salary advances taken this month, and net salary preview for a staff member.
   */
  static async getEmployeeMonthlySummary(
    schoolId: string,
    userId: string,
    month: number,
    year: number
  ) {
    const user: any = await User.findOne({ _id: userId, schoolId });
    if (!user) {
      throw { statusCode: 404, message: 'Staff member not found.', code: 'NOT_FOUND' };
    }

    const school = await School.findById(schoolId);

    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');

    // 1. Query Attendance records for this user and month
    const attendanceRecords = await Attendance.find({
      userId,
      date: { $regex: `^${year}-${monthStr}` },
    });

    const attendanceMap: Record<string, any> = {};
    attendanceRecords.forEach((att) => {
      attendanceMap[att.date] = att;
    });

    // 2. Query Approved Leaves for this user
    const leaves = await Leave.find({
      userId,
      status: LeaveStatus.APPROVED,
    });

    // 3. Query School Holidays for this month
    const holidays = await Holiday.find({
      schoolId,
    });

    // 4. Query Recorded Salary Advances taken in this month
    const recordedAdvances = await SalaryAdvance.find({
      userId,
      schoolId,
      month,
      year,
    }).sort({ date: -1 });

    const totalRecordedAdvanceAmount = recordedAdvances.reduce((sum, adv) => sum + adv.amount, 0);

    // Construct daily calendar mapping
    const calendar: Array<{
      day: number;
      date: string;
      dayOfWeek: string;
      status: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY' | 'PAID_LEAVE' | 'UNPAID_LEAVE' | 'HOLIDAY' | 'WEEKEND' | 'UPCOMING';
      note?: string;
    }> = [];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let presentDays = 0;
    let absentDays = 0;
    let halfDays = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;
    let holidayDays = 0;
    let weekendDays = 0;
    let lateDays = 0;
    let totalLateMinutes = 0;

    const shiftStartStr = school?.shiftStartTime || '09:00';
    const [startH, startM] = shiftStartStr.split(':').map(Number);
    const grace = school?.graceMinutes ?? 15;
    const shiftStartMinutesFromMidnight = startH * 60 + startM + grace;

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeekNum = dateObj.getDay();
      const dayOfWeek = daysOfWeek[dayOfWeekNum];

      let dayStatus: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY' | 'PAID_LEAVE' | 'UNPAID_LEAVE' | 'HOLIDAY' | 'WEEKEND' | 'UPCOMING' = 'ABSENT';
      let note = '';

      const att = attendanceMap[dateStr];

      // Check Holiday
      const isHoliday = holidays.some((h) => {
        const start = h.startDate;
        const end = h.endDate || h.startDate;
        return dateStr >= start && dateStr <= end;
      });

      // Check Leave
      const matchingLeave = leaves.find((l) => {
        return dateStr >= l.startDate && dateStr <= l.endDate;
      });

      if (att) {
        if (att.isLate || att.status === AttendanceStatus.LATE) {
          lateDays++;
          if (att.checkInAt) {
            const checkInDate = new Date(att.checkInAt);
            const checkInMins = checkInDate.getHours() * 60 + checkInDate.getMinutes();
            const delay = Math.max(0, checkInMins - shiftStartMinutesFromMidnight);
            totalLateMinutes += (delay > 0 ? delay : 15);
          } else {
            totalLateMinutes += 15;
          }
        }

        if (att.status === AttendanceStatus.PRESENT) {
          dayStatus = 'PRESENT';
          presentDays++;
        } else if (att.status === AttendanceStatus.LATE) {
          dayStatus = 'LATE';
          presentDays++;
          note = 'Late Check-in';
        } else if (att.status === AttendanceStatus.HALF_DAY) {
          dayStatus = 'HALF_DAY';
          halfDays++;
          note = 'Half Day';
        } else if (att.status === AttendanceStatus.ON_LEAVE) {
          if (matchingLeave && matchingLeave.leaveType === LeaveType.UNPAID) {
            dayStatus = 'UNPAID_LEAVE';
            unpaidLeaveDays++;
          } else {
            dayStatus = 'PAID_LEAVE';
            paidLeaveDays++;
          }
          note = matchingLeave ? `${matchingLeave.leaveType} Leave` : 'On Leave';
        } else if (att.status === AttendanceStatus.HOLIDAY) {
          dayStatus = 'HOLIDAY';
          holidayDays++;
        } else {
          dayStatus = 'ABSENT';
          absentDays++;
        }
      } else if (matchingLeave) {
        if (matchingLeave.leaveType === LeaveType.UNPAID) {
          dayStatus = 'UNPAID_LEAVE';
          unpaidLeaveDays++;
        } else {
          dayStatus = 'PAID_LEAVE';
          paidLeaveDays++;
        }
        note = `${matchingLeave.leaveType} Leave`;
      } else if (isHoliday) {
        dayStatus = 'HOLIDAY';
        holidayDays++;
        note = 'School Holiday';
      } else if (dayOfWeekNum === 0) {
        dayStatus = 'WEEKEND';
        weekendDays++;
        note = 'Sunday';
      } else if (dateStr > todayStr) {
        dayStatus = 'UPCOMING';
      } else {
        dayStatus = 'ABSENT';
        absentDays++;
      }

      calendar.push({
        day: d,
        date: dateStr,
        dayOfWeek,
        status: dayStatus,
        note,
      });
    }

    const baseSalary = user.baseSalary || 0;
    const perDaySalary = totalDaysInMonth > 0 ? Math.round(baseSalary / totalDaysInMonth) : 0;

    const isWorkedOrOnLeave = presentDays > 0 || paidLeaveDays > 0;

    let payableDays = 0;
    if (isWorkedOrOnLeave) {
      payableDays = Math.min(
        totalDaysInMonth,
        presentDays + paidLeaveDays + holidayDays + weekendDays + halfDays * 0.5
      );
    } else {
      payableDays = 0;
    }

    const effectiveUnpaidDays = Math.max(0, totalDaysInMonth - payableDays);

    let leaveDeductions = 0;
    if (payableDays === 0) {
      leaveDeductions = baseSalary;
    } else {
      leaveDeductions = Math.min(baseSalary, Math.round(effectiveUnpaidDays * perDaySalary));
    }

    // Check existing generated salary slip
    let existingSlip = await SalarySlip.findOne({ userId, month, year }).populate('generatedBy', 'name');
    
    // Always consider total recorded advances for this month if higher than existing slip snapshot
    const advanceDeduction = Math.max(
      totalRecordedAdvanceAmount,
      existingSlip?.advanceDeduction || existingSlip?.deductionsBreakdown?.advanceDeduction || 0
    );

    // Calculate Late Penalty based on active School policy
    const mode = school?.latePenaltyMode || 'PER_MINUTE';
    let autoLatePenalty = 0;
    if (mode === 'PER_MINUTE') {
      autoLatePenalty = totalLateMinutes * (school?.latePenaltyPerMinute ?? 5);
    } else if (mode === 'PER_LATE_DAY') {
      autoLatePenalty = lateDays * (school?.latePenaltyPerDay ?? 100);
    } else if (mode === 'HALF_DAY_AFTER_N_LATES') {
      const threshold = school?.lateDaysForHalfDayCut ?? 3;
      const cuts = Math.floor(lateDays / threshold);
      autoLatePenalty = Math.round(cuts * 0.5 * perDaySalary);
    } else {
      autoLatePenalty = 0;
    }

    const latePenalty = existingSlip?.deductionsBreakdown?.latePenalty !== undefined
      ? existingSlip.deductionsBreakdown.latePenalty
      : autoLatePenalty;

    const totalDeductions = leaveDeductions + advanceDeduction + latePenalty;
    const netSalary = Math.max(0, baseSalary - totalDeductions);

    // Auto-sync outdated saved slip in MongoDB
    if (existingSlip && (existingSlip.deductions !== totalDeductions || existingSlip.netSalary !== netSalary || existingSlip.baseSalary !== baseSalary)) {
      const recalculatedNet = Math.max(0, baseSalary - totalDeductions + (existingSlip.allowances || 0) + (existingSlip.bonus || 0));
      await SalarySlip.findByIdAndUpdate(existingSlip._id, {
        $set: {
          baseSalary,
          perDaySalary,
          advanceDeduction,
          deductions: totalDeductions,
          netSalary: recalculatedNet,
          presentDays,
          absentDays,
          unpaidLeaveDays,
          paidLeaveDays,
          'deductionsBreakdown.latePenalty': latePenalty,
        },
      });
      existingSlip = await SalarySlip.findById(existingSlip._id).populate('generatedBy', 'name');
    }

    return {
      staff: {
        id: user.id,
        name: user.name,
        employeeId: user.employeeId,
        designation: user.designation || 'Staff Member',
        department: user.department || 'Academics',
        baseSalary,
        bankDetails: user.bankDetails || {},
      },
      month,
      year,
      totalDaysInMonth,
      perDaySalary,
      counts: {
        presentDays,
        absentDays,
        halfDays,
        paidLeaveDays,
        unpaidLeaveDays,
        holidayDays,
        weekendDays,
        payableDays,
        lateDays,
        totalLateMinutes,
      },
      calculated: {
        baseSalary,
        perDaySalary,
        payableDays,
        effectiveUnpaidDays,
        leaveDeductions,
        advanceDeduction,
        latePenalty: autoLatePenalty,
        deductions: totalDeductions,
        netSalary,
      },
      recordedAdvances: recordedAdvances.map((adv) => ({
        id: adv.id,
        amount: adv.amount,
        date: adv.date,
        paymentMode: adv.paymentMode,
        remarks: adv.remarks,
        isDeducted: adv.isDeducted,
      })),
      calendar,
      existingSlip: existingSlip || null,
    };
  }

  /**
   * Admin: Get monthly attendance summary and salary calculation for ALL active staff members in a school.
   */
  static async getBulkMonthlySummary(
    schoolId: string,
    month: number,
    year: number
  ) {
    const staffList = await User.find({ schoolId, isActive: true }).sort({ name: 1 });
    const staffSummaries = [];

    let totalBaseSalary = 0;
    let totalNetSalary = 0;
    let totalAdvancesGiven = 0;
    let slipsGeneratedCount = 0;
    let slipsPaidCount = 0;

    for (const staff of staffList) {
      const summary = await this.getEmployeeMonthlySummary(schoolId, staff._id.toString(), month, year);
      
      const isSlipGenerated = !!summary.existingSlip;
      const isPaid = summary.existingSlip?.status === SalarySlipStatus.PAID;

      if (isSlipGenerated) slipsGeneratedCount++;
      if (isPaid) slipsPaidCount++;

      totalBaseSalary += summary.calculated.baseSalary;
      totalNetSalary += summary.calculated.netSalary;
      totalAdvancesGiven += summary.calculated.advanceDeduction;

      staffSummaries.push({
        staff: {
          id: staff.id,
          name: staff.name,
          employeeId: staff.employeeId,
          designation: staff.designation || 'Staff Member',
          department: staff.department || 'Academics',
          email: staff.email || '',
          phone: staff.phone || '',
          baseSalary: staff.baseSalary || 0,
          bankDetails: staff.bankDetails || {},
        },
        month,
        year,
        totalDaysInMonth: summary.totalDaysInMonth,
        perDaySalary: summary.perDaySalary,
        counts: summary.counts,
        calculated: summary.calculated,
        recordedAdvances: summary.recordedAdvances,
        calendar: summary.calendar,
        existingSlip: summary.existingSlip,
        status: summary.existingSlip?.status || 'NOT_GENERATED',
      });
    }

    return {
      month,
      year,
      schoolStats: {
        totalStaff: staffList.length,
        totalBaseSalary,
        totalNetSalary,
        totalAdvancesGiven,
        slipsGeneratedCount,
        slipsPaidCount,
      },
      staffSummaries,
    };
  }

  /**
   * Record a new Salary Advance given to a Staff Member
   */
  static async recordSalaryAdvance(
    createdById: string,
    schoolId: string,
    payload: {
      userId: string;
      amount: number;
      date?: Date | string;
      paymentMode?: string;
      remarks?: string;
    }
  ) {
    const { userId, amount, paymentMode = 'Cash', remarks } = payload;
    const user = await User.findOne({ _id: userId, schoolId });
    if (!user) {
      throw { statusCode: 404, message: 'Staff member not found.', code: 'NOT_FOUND' };
    }

    const advanceDate = payload.date ? new Date(payload.date) : new Date();
    const month = advanceDate.getMonth() + 1;
    const year = advanceDate.getFullYear();

    const advance = await SalaryAdvance.create({
      userId,
      schoolId,
      amount,
      date: advanceDate,
      month,
      year,
      paymentMode,
      remarks,
      isDeducted: false,
      createdById,
    });

    // Auto-update monthly summary & existing slip so table immediately reflects the advance
    await this.getEmployeeMonthlySummary(schoolId, userId, month, year);

    await AuditService.record({
      actorId: createdById,
      action: 'SALARY_ADVANCE_RECORDED',
      entity: 'SalaryAdvance',
      entityId: advance.id,
      metadata: { userId, amount, month, year, paymentMode },
    });

    return advance.populate('user', 'name employeeId designation department');
  }

  /**
   * Fetch all salary advances given for a school
   */
  static async getSalaryAdvances(schoolId: string, filters: { month?: number; year?: number; userId?: string } = {}) {
    const query: any = { schoolId };
    if (filters.month) query.month = filters.month;
    if (filters.year) query.year = filters.year;
    if (filters.userId) query.userId = filters.userId;

    const advances = await SalaryAdvance.find(query)
      .sort({ date: -1 })
      .populate('user', 'name employeeId designation department avatarUrl')
      .populate('createdBy', 'name');

    return advances;
  }

  /**
   * Delete a recorded salary advance
   */
  static async deleteSalaryAdvance(schoolId: string, advanceId: string) {
    const advance = await SalaryAdvance.findOne({ _id: advanceId, schoolId });
    if (!advance) {
      throw { statusCode: 404, message: 'Advance record not found.', code: 'NOT_FOUND' };
    }

    await SalaryAdvance.findByIdAndDelete(advanceId);
    return { message: 'Salary advance record deleted successfully.' };
  }

  /**
   * Generates or updates an official Salary Slip for an employee with itemized breakdown & same-month advance deduction.
   */
  static async generateSalarySlip(
    adminUserId: string,
    schoolId: string,
    payload: {
      userId: string;
      month: number;
      year: number;
      baseSalary?: number;
      earnings?: {
        baseSalary?: number;
        hra?: number;
        transportAllowance?: number;
        specialAllowance?: number;
        bonus?: number;
      };
      deductionsBreakdown?: {
        leaveDeduction?: number;
        advanceDeduction?: number;
        latePenalty?: number;
        pfDeduction?: number;
        taxDeduction?: number;
      };
      allowances?: number;
      bonus?: number;
      deductions?: number;
      advanceDeduction?: number;
      remarks?: string;
    }
  ) {
    const { userId, month, year, remarks } = payload;

    const user: any = await User.findOne({ _id: userId, schoolId });
    if (!user) {
      throw { statusCode: 404, message: 'Staff member not found.', code: 'NOT_FOUND' };
    }

    // Get attendance & summary calculation
    const summary = await this.getEmployeeMonthlySummary(schoolId, userId, month, year);

    const baseSalary = payload.baseSalary !== undefined ? payload.baseSalary : (payload.earnings?.baseSalary ?? summary.calculated.baseSalary);
    const perDaySalary = summary.perDaySalary;

    const hra = payload.earnings?.hra || 0;
    const transportAllowance = payload.earnings?.transportAllowance || 0;
    const specialAllowance = payload.earnings?.specialAllowance || 0;
    const bonus = payload.earnings?.bonus ?? payload.bonus ?? 0;
    const extraAllowances = payload.allowances || 0;

    const totalEarnings = baseSalary + hra + transportAllowance + specialAllowance + bonus + extraAllowances;

    const leaveDeduction = payload.deductionsBreakdown?.leaveDeduction ?? summary.calculated.leaveDeductions;
    const advanceDeduction = payload.deductionsBreakdown?.advanceDeduction ?? payload.advanceDeduction ?? summary.calculated.advanceDeduction;
    const latePenalty = payload.deductionsBreakdown?.latePenalty ?? summary.calculated.latePenalty;
    const pfDeduction = payload.deductionsBreakdown?.pfDeduction || 0;
    const taxDeduction = payload.deductionsBreakdown?.taxDeduction || 0;

    const totalDeductions = payload.deductions !== undefined
      ? payload.deductions
      : leaveDeduction + advanceDeduction + latePenalty + pfDeduction + taxDeduction;

    const netSalary = Math.max(0, totalEarnings - totalDeductions);

    // Bank Details Snapshot
    const bankDetailsSnapshot = user.bankDetails
      ? {
          bankName: user.bankDetails.bankName || '',
          accountNumber: user.bankDetails.accountNumber || '',
          ifscCode: user.bankDetails.ifscCode || '',
          upiId: user.bankDetails.upiId || '',
          panNumber: user.bankDetails.panNumber || '',
        }
      : {};

    // Upsert SalarySlip
    const slip = await SalarySlip.findOneAndUpdate(
      { userId, month, year },
      {
        $set: {
          schoolId,
          baseSalary,
          perDaySalary,
          totalDaysInMonth: summary.totalDaysInMonth,
          presentDays: summary.counts.presentDays,
          absentDays: summary.counts.absentDays,
          halfDays: summary.counts.halfDays,
          paidLeaveDays: summary.counts.paidLeaveDays,
          unpaidLeaveDays: summary.counts.unpaidLeaveDays,
          holidayDays: summary.counts.holidayDays,
          weekendDays: summary.counts.weekendDays,
          earnings: {
            baseSalary,
            hra,
            transportAllowance,
            specialAllowance,
            bonus,
          },
          deductionsBreakdown: {
            leaveDeduction,
            advanceDeduction,
            latePenalty,
            pfDeduction,
            taxDeduction,
          },
          deductions: totalDeductions,
          allowances: extraAllowances + hra + transportAllowance + specialAllowance,
          bonus,
          advanceDeduction,
          netSalary,
          bankDetailsSnapshot,
          remarks,
          generatedById: adminUserId,
          status: SalarySlipStatus.GENERATED,
        },
      },
      { new: true, upsert: true }
    )
      .populate('user', 'name employeeId designation department avatarUrl bankDetails')
      .populate('generatedBy', 'name');

    // Mark recorded advances for this user & month as deducted
    await SalaryAdvance.updateMany(
      { userId, schoolId, month, year },
      { $set: { isDeducted: true, generatedSlipId: slip._id } }
    );

    // Also update staff base salary in User model if modified
    if (payload.baseSalary !== undefined) {
      await User.findByIdAndUpdate(userId, { baseSalary });
    }

    await AuditService.record({
      actorId: adminUserId,
      action: 'SALARY_SLIP_GENERATED',
      entity: 'SalarySlip',
      entityId: slip.id,
      metadata: { userId, month, year, netSalary, advanceDeduction },
    });

    return slip;
  }

  /**
   * Admin: Generate salary slips for ALL active staff members in a school for a month/year.
   */
  static async generateBulkSalarySlips(
    adminUserId: string,
    schoolId: string,
    month: number,
    year: number
  ) {
    const staffMembers = await User.find({ schoolId, isActive: true });
    const generatedSlips = [];

    for (const staff of staffMembers) {
      const slip = await this.generateSalarySlip(adminUserId, schoolId, {
        userId: staff._id.toString(),
        month,
        year,
      });
      generatedSlips.push(slip);
    }

    return generatedSlips;
  }

  /**
   * Retrieves all generated salary slips with optional filtering.
   */
  static async getAllSalarySlips(
    schoolId: string,
    filters: {
      month?: number;
      year?: number;
      department?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const query: any = { schoolId };

    if (filters.month) query.month = filters.month;
    if (filters.year) query.year = filters.year;
    if (filters.status) query.status = filters.status;

    const page = filters.page || 1;
    const limit = filters.limit || 100;
    const skip = (page - 1) * limit;

    let slips = await SalarySlip.find(query)
      .sort({ year: -1, month: -1, createdAt: -1 })
      .populate('user', 'name employeeId designation department avatarUrl email phone bankDetails')
      .populate('generatedBy', 'name');

    if (filters.department) {
      slips = slips.filter((s: any) => s.user?.department === filters.department);
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      slips = slips.filter(
        (s: any) =>
          searchRegex.test(s.user?.name || '') ||
          searchRegex.test(s.user?.employeeId || '') ||
          searchRegex.test(s.user?.designation || '')
      );
    }

    const total = slips.length;
    const paginatedSlips = slips.slice(skip, skip + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      slips: paginatedSlips,
    };
  }

  /**
   * Updates salary payment status (e.g. mark as PAID, set payment date, mode, ref).
   */
  static async updateSalaryStatus(
    adminUserId: string,
    slipId: string,
    payload: {
      status: SalarySlipStatus;
      paymentDate?: Date | string;
      paymentMode?: string;
      transactionRef?: string;
      remarks?: string;
    }
  ) {
    const slip = await SalarySlip.findById(slipId);
    if (!slip) {
      throw { statusCode: 404, message: 'Salary slip not found.', code: 'NOT_FOUND' };
    }

    const updateFields: any = {
      status: payload.status,
    };

    if (payload.paymentDate) updateFields.paymentDate = new Date(payload.paymentDate);
    else if (payload.status === SalarySlipStatus.PAID && !slip.paymentDate) {
      updateFields.paymentDate = new Date();
    }

    if (payload.paymentMode) updateFields.paymentMode = payload.paymentMode;
    if (payload.transactionRef) updateFields.transactionRef = payload.transactionRef;
    if (payload.remarks !== undefined) updateFields.remarks = payload.remarks;

    const updated = await SalarySlip.findByIdAndUpdate(slipId, { $set: updateFields }, { new: true })
      .populate('user', 'name employeeId designation department avatarUrl bankDetails')
      .populate('generatedBy', 'name');

    await AuditService.record({
      actorId: adminUserId,
      action: 'SALARY_STATUS_UPDATED',
      entity: 'SalarySlip',
      entityId: slipId,
      metadata: { status: payload.status, paymentMode: payload.paymentMode },
    });

    return updated;
  }

  /**
   * Fetches salary slips for a specific logged in staff member.
   */
  static async getMySalarySlips(userId: string) {
    const slips = await SalarySlip.find({ userId })
      .sort({ year: -1, month: -1 })
      .populate('school', 'name logoUrl address')
      .populate('generatedBy', 'name');

    return slips;
  }

  /**
   * Fetches single salary slip details by ID.
   */
  static async getSalarySlipById(slipId: string) {
    const slip = await SalarySlip.findById(slipId)
      .populate('user', 'name employeeId designation department phone email avatarUrl schoolId bankDetails')
      .populate('school', 'name logoUrl address phone email')
      .populate('generatedBy', 'name');

    if (!slip) {
      throw { statusCode: 404, message: 'Salary slip not found.', code: 'NOT_FOUND' };
    }

    return slip;
  }

  /**
   * Export Direct Bank Payout Sheet (CSV Data)
   */
  static async exportBankPayoutSheet(schoolId: string, month: number, year: number) {
    const bulkData = await this.getBulkMonthlySummary(schoolId, month, year);
    const payoutRows = bulkData.staffSummaries.map((item) => {
      const bank = item.staff.bankDetails || {};
      const slip = item.existingSlip;
      return {
        employeeId: item.staff.employeeId,
        staffName: item.staff.name,
        designation: item.staff.designation,
        department: item.staff.department,
        bankName: bank.bankName || 'NOT_PROVIDED',
        accountNumber: bank.accountNumber ? `'${bank.accountNumber}` : 'NOT_PROVIDED',
        ifscCode: bank.ifscCode || 'NOT_PROVIDED',
        upiId: bank.upiId || 'N/A',
        panNumber: bank.panNumber || 'N/A',
        baseSalary: item.calculated.baseSalary,
        totalDeductions: item.calculated.deductions,
        advanceDeduction: item.calculated.advanceDeduction,
        netPayable: item.calculated.netSalary,
        slipStatus: item.status,
        paymentMode: slip?.paymentMode || 'Bank Transfer',
        paymentRef: slip?.transactionRef || '',
      };
    });

    return {
      month,
      year,
      totalStaff: payoutRows.length,
      totalNetDisbursement: payoutRows.reduce((sum, r) => sum + r.netPayable, 0),
      rows: payoutRows,
    };
  }
}
