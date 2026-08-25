import { Request, Response, NextFunction } from 'express';
import { StaffService } from '../services/staffService';
import { ResponseUtil } from '../utils/response';

export class StaffController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await StaffService.getProfile(userId);
      return ResponseUtil.success(res, profile, 'Profile retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await StaffService.updateProfile(userId, req.body);
      return ResponseUtil.success(res, updated, 'Profile updated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return ResponseUtil.error(
          res,
          'Current password and new password are required.',
          'VALIDATION_ERROR',
          400
        );
      }

      if (newPassword.length < 6) {
        return ResponseUtil.error(
          res,
          'New password must be at least 6 characters long.',
          'VALIDATION_ERROR',
          400
        );
      }

      const result = await StaffService.changePassword(userId, currentPassword, newPassword);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  // ============================================================
  // ADMIN CONTROLLERS
  // ============================================================

  static async getAllStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const { search, department, role, isActive, page, limit } = req.query;

      const result = await StaffService.getAllStaff(schoolId, {
        search: search as string,
        department: department as string,
        role: role as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });

      return ResponseUtil.success(res, result, 'Staff members retrieved successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const schoolId = req.user!.schoolId;
      const { name, email, phone, designation, department, role, baseSalary, employeeId, password } = req.body;

      if (!name) {
        return ResponseUtil.error(res, 'Staff member name is required.', 'VALIDATION_ERROR', 400);
      }

      const result = await StaffService.createStaff(adminUserId, schoolId, {
        name,
        email,
        phone,
        designation,
        department,
        role,
        baseSalary: baseSalary ? Number(baseSalary) : undefined,
        employeeId,
        password,
      });

      return ResponseUtil.success(res, result, 'Staff member created successfully.', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async updateStaffByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;

      const result = await StaffService.updateStaffByAdmin(adminUserId, id, req.body);
      return ResponseUtil.success(res, result, 'Staff member updated successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async resetPasswordByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;
      const { password } = req.body;

      const result = await StaffService.adminResetPassword(adminUserId, id, password);
      return ResponseUtil.success(res, result, 'Password reset successfully.');
    } catch (error) {
      return next(error);
    }
  }

  static async deleteStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId;
      const { id } = req.params;

      const result = await StaffService.deleteStaff(adminUserId, id);
      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }
}

