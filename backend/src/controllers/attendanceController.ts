import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from '../services/attendanceService';
import { ResponseUtil } from '../utils/response';

export class AttendanceController {
  static async getTodayStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, schoolId } = req.user!;
      const status = await AttendanceService.getTodayStatus(userId, schoolId);
      return ResponseUtil.success(res, status, "Today's attendance status retrieved.");
    } catch (error) {
      return next(error);
    }
  }

  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, schoolId } = req.user!;
      const { latitude, longitude, accuracy, timestamp, selfieBase64, selfieUrl, deviceInfo } = req.body;

      if (!latitude || !longitude) {
        return ResponseUtil.error(res, 'GPS coordinates (latitude and longitude) are required.', 'VALIDATION_ERROR', 400);
      }

      const result = await AttendanceService.checkIn(userId, schoolId, {
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: accuracy ? Number(accuracy) : undefined,
        timestamp,
        selfieBase64,
        selfieUrl,
        deviceInfo,
      });

      return ResponseUtil.success(res, result, result.message, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, schoolId } = req.user!;
      const { latitude, longitude, accuracy, timestamp, selfieBase64, selfieUrl, deviceInfo } = req.body;

      if (!latitude || !longitude) {
        return ResponseUtil.error(res, 'GPS coordinates (latitude and longitude) are required.', 'VALIDATION_ERROR', 400);
      }

      const result = await AttendanceService.checkOut(userId, schoolId, {
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: accuracy ? Number(accuracy) : undefined,
        timestamp,
        selfieBase64,
        selfieUrl,
        deviceInfo,
      });

      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { page, limit, from, to, month } = req.query;

      const result = await AttendanceService.getHistory(userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        from: from as string,
        to: to as string,
        month: month as string,
      });

      return ResponseUtil.paginated(
        res,
        result.items,
        result.total,
        result.page,
        result.limit,
        'Attendance history retrieved.'
      );
    } catch (error) {
      return next(error);
    }
  }

  static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await AttendanceService.getDetail(id, userId);
      return ResponseUtil.success(res, result, 'Attendance record detail retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  // ============================================================
  // ADMIN ATTENDANCE CONTROLLERS
  // ============================================================

  static async getAllAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { date, department, status, search, page, limit } = req.query;

      const result = await AttendanceService.getAllStaffAttendance(schoolId, {
        date: date as string,
        department: department as string,
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      return ResponseUtil.success(res, result, 'Staff attendance records retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async overrideAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;

      const result = await AttendanceService.overrideAttendanceByAdmin(adminUserId, id, req.body);
      return ResponseUtil.success(res, result, 'Attendance record overridden successfully.');
    } catch (error) {
      return next(error);
    }
  }
}

