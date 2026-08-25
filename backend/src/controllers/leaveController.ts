import { Request, Response, NextFunction } from 'express';
import { LeaveService } from '../services/leaveService';
import { ResponseUtil } from '../utils/response';

export class LeaveController {
  static async applyLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { type, startDate, endDate, reason, attachmentBase64, attachmentUrl } = req.body;

      if (!type || !startDate || !endDate || !reason) {
        return ResponseUtil.error(res, 'Type, startDate, endDate, and reason are required.', 'VALIDATION_ERROR', 400);
      }

      const result = await LeaveService.applyLeave(userId, {
        type,
        startDate,
        endDate,
        reason,
        attachmentBase64,
        attachmentUrl,
      });

      return ResponseUtil.success(res, result, result.message, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async getLeaveList(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const leaves = await LeaveService.getLeaveList(userId);
      return ResponseUtil.success(res, leaves, 'Leave list retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  static async getQuotas(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const quotas = await LeaveService.getQuotas(userId);
      return ResponseUtil.success(res, quotas, 'Leave quotas retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const detail = await LeaveService.getDetail(id, userId);
      return ResponseUtil.success(res, detail, 'Leave detail retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  static async cancelLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await LeaveService.cancelLeave(id, userId);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async approveLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewerId = req.user!.userId;
      const { id } = req.params;
      const { comment } = req.body;
      const result = await LeaveService.approveLeave(id, reviewerId, comment);
      return ResponseUtil.success(res, result, 'Leave approved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async rejectLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewerId = req.user!.userId;
      const { id } = req.params;
      const { comment } = req.body;
      const result = await LeaveService.rejectLeave(id, reviewerId, comment);
      return ResponseUtil.success(res, result, 'Leave rejected successfully.');
    } catch (error) {
      return next(error);
    }
  }

  // ============================================================
  // ADMIN LEAVE CONTROLLERS
  // ============================================================

  static async getAllLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { status, search, page, limit } = req.query;

      const result = await LeaveService.getAllLeaveRequests(schoolId, {
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      return ResponseUtil.success(res, result, 'All leave requests retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }
}

