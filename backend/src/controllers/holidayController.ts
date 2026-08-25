import { Request, Response, NextFunction } from 'express';
import { HolidayService } from '../services/holidayService';
import { ResponseUtil } from '../utils/response';

export class HolidayController {
  static async getHolidays(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { year } = req.query;
      const holidays = await HolidayService.getHolidays(schoolId, year ? Number(year) : undefined);
      return ResponseUtil.success(res, holidays, 'Holiday calendar retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  static async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { id } = req.params;
      const detail = await HolidayService.getDetail(id, schoolId);
      return ResponseUtil.success(res, detail, 'Holiday detail retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  static async createHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { name, startDate, endDate, type, description } = req.body;

      if (!name || !startDate || !type) {
        return ResponseUtil.error(res, 'Name, startDate, and type are required.', 'VALIDATION_ERROR', 400);
      }

      const result = await HolidayService.createHoliday(schoolId, { name, startDate, endDate, type, description });
      return ResponseUtil.success(res, result, 'Holiday created successfully.', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async updateHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { id } = req.params;

      const result = await HolidayService.updateHoliday(id, schoolId, req.body);
      return ResponseUtil.success(res, result, 'Holiday updated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async deleteHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { id } = req.params;

      const result = await HolidayService.deleteHoliday(id, schoolId);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }
}

