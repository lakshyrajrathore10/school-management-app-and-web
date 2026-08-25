import { Request, Response, NextFunction } from 'express';
import { SchoolService } from '../services/schoolService';
import { ResponseUtil } from '../utils/response';

export class SchoolController {
  static async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const config = await SchoolService.getSchoolConfig(schoolId);
      return ResponseUtil.success(res, config, 'School configuration retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  static async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const updated = await SchoolService.updateSchoolConfig(schoolId, req.body);
      return ResponseUtil.success(res, updated, 'School configuration updated successfully.');
    } catch (error) {
      return next(error);
    }
  }
}

