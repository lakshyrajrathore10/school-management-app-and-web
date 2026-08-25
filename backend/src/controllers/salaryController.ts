import { Request, Response, NextFunction } from 'express';
import { SalaryService } from '../services/salaryService';
import { ResponseUtil } from '../utils/response';

export class SalaryController {
  /**
   * Admin: Get monthly attendance & calendar summary preview for a staff member.
   */
  static async getEmployeeMonthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { userId, month, year } = req.query;

      if (!userId || !month || !year) {
        return ResponseUtil.error(
          res,
          'userId, month, and year are required query parameters.',
          'VALIDATION_ERROR',
          400
        );
      }

      const summary = await SalaryService.getEmployeeMonthlySummary(
        schoolId,
        userId as string,
        parseInt(month as string, 10),
        parseInt(year as string, 10)
      );

      return ResponseUtil.success(res, summary, 'Employee monthly summary calculated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Get monthly attendance & salary calculation summaries for ALL staff members.
   */
  static async getBulkMonthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { month, year } = req.query;

      if (!month || !year) {
        return ResponseUtil.error(
          res,
          'month and year are required query parameters.',
          'VALIDATION_ERROR',
          400
        );
      }

      const summary = await SalaryService.getBulkMonthlySummary(
        schoolId,
        parseInt(month as string, 10),
        parseInt(year as string, 10)
      );

      return ResponseUtil.success(res, summary, 'Bulk staff monthly summary calculated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Generate or update salary slip for an employee.
   */
  static async generateSalarySlip(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const schoolId = req.user!.schoolId;
      const {
        userId,
        month,
        year,
        baseSalary,
        earnings,
        deductionsBreakdown,
        allowances,
        bonus,
        deductions,
        advanceDeduction,
        remarks,
      } = req.body;

      if (!userId || !month || !year) {
        return ResponseUtil.error(
          res,
          'userId, month, and year are required.',
          'VALIDATION_ERROR',
          400
        );
      }

      const slip = await SalaryService.generateSalarySlip(adminUserId, schoolId, {
        userId,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : undefined,
        earnings,
        deductionsBreakdown,
        allowances: allowances !== undefined ? parseFloat(allowances) : 0,
        bonus: bonus !== undefined ? parseFloat(bonus) : 0,
        deductions: deductions !== undefined ? parseFloat(deductions) : undefined,
        advanceDeduction: advanceDeduction !== undefined ? parseFloat(advanceDeduction) : undefined,
        remarks,
      });

      return ResponseUtil.success(res, slip, 'Salary slip generated successfully.', 201);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Generate bulk salary slips for all staff members.
   */
  static async generateBulkSalarySlips(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const schoolId = req.user!.schoolId;
      const { month, year } = req.body;

      if (!month || !year) {
        return ResponseUtil.error(res, 'month and year are required.', 'VALIDATION_ERROR', 400);
      }

      const slips = await SalaryService.generateBulkSalarySlips(
        adminUserId,
        schoolId,
        parseInt(month, 10),
        parseInt(year, 10)
      );

      return ResponseUtil.success(res, slips, `Bulk payroll generated for ${slips.length} staff members.`, 201);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Get list of generated salary slips.
   */
  static async getAllSalarySlips(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { month, year, department, status, search, page, limit } = req.query;

      const result = await SalaryService.getAllSalarySlips(schoolId, {
        month: month ? parseInt(month as string, 10) : undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        department: department as string,
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      return ResponseUtil.success(res, result, 'Salary slips retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Update salary slip status (e.g. mark as PAID).
   */
  static async updateSalaryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;
      const { status, paymentDate, paymentMode, transactionRef, remarks } = req.body;

      if (!status) {
        return ResponseUtil.error(res, 'Status is required.', 'VALIDATION_ERROR', 400);
      }

      const updated = await SalaryService.updateSalaryStatus(adminUserId, id, {
        status,
        paymentDate,
        paymentMode,
        transactionRef,
        remarks,
      });

      return ResponseUtil.success(res, updated, 'Salary status updated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Staff App: Get logged-in user's salary slips.
   */
  static async getMySalarySlips(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const slips = await SalaryService.getMySalarySlips(userId);
      return ResponseUtil.success(res, slips, 'My salary slips retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get single salary slip detail by ID.
   */
  static async getSalarySlipById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const slip = await SalaryService.getSalarySlipById(id);
      return ResponseUtil.success(res, slip, 'Salary slip details retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Record a new Salary Advance given to staff (अग्रिम वेतन)
   */
  static async recordSalaryAdvance(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const schoolId = req.user!.schoolId;
      const { userId, amount, date, paymentMode, remarks } = req.body;

      if (!userId || !amount) {
        return ResponseUtil.error(res, 'userId and amount are required.', 'VALIDATION_ERROR', 400);
      }

      const advance = await SalaryService.recordSalaryAdvance(adminUserId, schoolId, {
        userId,
        amount: parseFloat(amount),
        date,
        paymentMode,
        remarks,
      });

      return ResponseUtil.success(res, advance, 'Salary advance recorded successfully.', 201);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Fetch all salary advances recorded for school
   */
  static async getSalaryAdvances(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { month, year, userId } = req.query;

      const advances = await SalaryService.getSalaryAdvances(schoolId, {
        month: month ? parseInt(month as string, 10) : undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        userId: userId as string,
      });

      return ResponseUtil.success(res, advances, 'Salary advances retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Delete a recorded salary advance
   */
  static async deleteSalaryAdvance(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { id } = req.params;

      const result = await SalaryService.deleteSalaryAdvance(schoolId, id);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Admin: Export Bank Payout Sheet (JSON data for CSV download)
   */
  static async exportBankPayoutSheet(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { month, year } = req.query;

      if (!month || !year) {
        return ResponseUtil.error(res, 'month and year are required query parameters.', 'VALIDATION_ERROR', 400);
      }

      const data = await SalaryService.exportBankPayoutSheet(
        schoolId,
        parseInt(month as string, 10),
        parseInt(year as string, 10)
      );

      return ResponseUtil.success(res, data, 'Bank payout sheet exported successfully.');
    } catch (error) {
      return next(error);
    }
  }
}
