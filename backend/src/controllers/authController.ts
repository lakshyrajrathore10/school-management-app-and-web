import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseUtil } from '../utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, password } = req.body;
      const result = await AuthService.login(employeeId, password, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      return ResponseUtil.success(res, result, 'Login successful.');
    } catch (error) {
      return next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return ResponseUtil.error(res, 'Refresh token is required.', 'VALIDATION_ERROR', 400);
      }
      const result = await AuthService.refresh(refreshToken);
      return ResponseUtil.success(res, result, 'Token refreshed successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { refreshToken } = req.body;
      const result = await AuthService.logout(userId, refreshToken, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      return ResponseUtil.success(res, result, 'Logout successful.');
    } catch (error) {
      return next(error);
    }
  }
}
