import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { ResponseUtil } from '../utils/response';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = await NotificationService.getNotifications(userId);
      return ResponseUtil.success(res, notifications, 'Notifications retrieved.');
    } catch (error) {
      return next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await NotificationService.markAsRead(id, userId);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await NotificationService.markAllAsRead(userId);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await NotificationService.deleteNotification(id, userId);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  static async broadcastNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { title, body, type, targetRole, targetDepartment } = req.body;

      if (!title || !body) {
        return ResponseUtil.error(res, 'Title and body are required.', 'VALIDATION_ERROR', 400);
      }

      const result = await NotificationService.broadcastNotification(schoolId, {
        title,
        body,
        type,
        targetRole,
        targetDepartment,
      });

      return ResponseUtil.success(res, result, result.message, 201);
    } catch (error) {
      return next(error);
    }
  }
}

