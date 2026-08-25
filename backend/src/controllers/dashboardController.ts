import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { ResponseUtil } from '../utils/response';

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, schoolId } = req.user!;
      const data = await DashboardService.getDashboard(userId, schoolId);
      return ResponseUtil.success(res, data, 'Dashboard metrics retrieved.');
    } catch (error) {
      return next(error);
    }
  }
}
