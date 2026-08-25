import { User, RefreshToken } from '../models';
import { hashPassword, verifyPassword } from '../utils/password';
import { AuditService } from './auditService';
import { Role } from '../types/enums';

export class StaffService {

  static async getProfile(userId: string) {
    const user: any = await User.findById(userId).populate('school');

    if (!user) {
      throw { statusCode: 404, message: 'User profile not found.', code: 'NOT_FOUND' };
    }

    return {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email || '',
      phone: user.phone || undefined,
      designation: user.designation || 'Staff Member',
      department: user.department || 'Academics',
      schoolName: user.school?.name || '',
      schoolId: user.schoolId.toString(),
      avatarUrl: user.avatarUrl || undefined,
      role: user.role,
      baseSalary: user.baseSalary || 0,
      bankDetails: user.bankDetails || {},
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
    };
  }

  static async updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string; department?: string; designation?: string; bankDetails?: any }) {
    const updated: any = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: data.name,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
          department: data.department,
          designation: data.designation,
          bankDetails: data.bankDetails,
        },
      },
      { new: true }
    ).populate('school');

    if (!updated) {
      throw { statusCode: 404, message: 'User not found.', code: 'NOT_FOUND' };
    }

    await AuditService.record({
      actorId: userId,
      action: 'PROFILE_UPDATED',
      entity: 'User',
      entityId: userId,
      metadata: data,
    });

    return {
      id: updated.id,
      employeeId: updated.employeeId,
      name: updated.name,
      email: updated.email || '',
      phone: updated.phone || undefined,
      designation: updated.designation || 'Staff Member',
      department: updated.department || 'Academics',
      schoolName: updated.school?.name || '',
      schoolId: updated.schoolId.toString(),
      avatarUrl: updated.avatarUrl || undefined,
      bankDetails: updated.bankDetails || {},
    };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw { statusCode: 404, message: 'User not found.', code: 'NOT_FOUND' };
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw { statusCode: 400, message: 'Current password is incorrect.', code: 'INVALID_PASSWORD' };
    }

    const newHash = await hashPassword(newPassword);

    await User.findByIdAndUpdate(userId, { passwordHash: newHash });

    // Revoke all refresh tokens for security
    await RefreshToken.updateMany({ userId }, { isRevoked: true });

    await AuditService.record({
      actorId: userId,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: userId,
    });

    return { message: 'Password changed successfully. Please log in again with your new password.' };
  }

  // ============================================================
  // ADMIN STAFF MANAGEMENT METHODS
  // ============================================================

  static async getAllStaff(
    schoolId: string,
    options: { search?: string; department?: string; role?: string; isActive?: boolean; page?: number; limit?: number } = {}
  ) {
    const query: any = { schoolId };

    if (options.department) {
      query.department = options.department;
    }
    if (options.role) {
      query.role = options.role;
    }
    if (options.isActive !== undefined) {
      query.isActive = options.isActive;
    }
    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      query.$or = [
        { name: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { designation: searchRegex },
      ];
    }

    const page = options.page || 1;
    const limit = options.limit || 100;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('school'),
    ]);

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      designation: user.designation || 'Staff Member',
      department: user.department || 'General',
      role: user.role,
      baseSalary: user.baseSalary || 0,
      bankDetails: user.bankDetails || {},
      isActive: user.isActive,
      schoolName: user.school?.name || '',
      avatarUrl: user.avatarUrl || undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || null,
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      staff: formattedUsers,
    };
  }

  static async createStaff(
    adminUserId: string,
    schoolId: string,
    payload: {
      name: string;
      email?: string;
      phone?: string;
      designation?: string;
      department?: string;
      role?: string;
      baseSalary?: number;
      bankDetails?: any;
      employeeId?: string;
      password?: string;
    }
  ) {
    let finalEmployeeId = payload.employeeId?.trim();
    if (!finalEmployeeId) {
      const count = await User.countDocuments({ schoolId });
      const nextNum = (count + 101).toString().padStart(4, '0');
      finalEmployeeId = `EMP-${nextNum}`;
    }

    const existing = await User.findOne({ employeeId: finalEmployeeId });
    if (existing) {
      throw { statusCode: 400, message: `Employee ID "${finalEmployeeId}" already exists.`, code: 'DUPLICATE_EMPLOYEE_ID' };
    }

    const plainPassword = payload.password?.trim() || `Staff@${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordHash = await hashPassword(plainPassword);

    const newUser: any = await User.create({
      employeeId: finalEmployeeId,
      name: payload.name.trim(),
      email: payload.email?.trim() || undefined,
      phone: payload.phone?.trim() || undefined,
      designation: payload.designation?.trim() || 'Staff Member',
      department: payload.department?.trim() || 'Academics',
      role: (payload.role as Role) || Role.STAFF,
      baseSalary: payload.baseSalary || 0,
      bankDetails: payload.bankDetails || {},
      passwordHash,
      schoolId,
      isActive: true,
    });

    await AuditService.record({
      actorId: adminUserId,
      action: 'STAFF_CREATED',
      entity: 'User',
      entityId: newUser.id || newUser._id.toString(),
      metadata: { employeeId: finalEmployeeId, role: payload.role },
    });

    return {
      id: newUser.id || newUser._id.toString(),
      employeeId: newUser.employeeId,
      name: newUser.name,
      email: newUser.email || '',
      phone: newUser.phone || '',
      designation: newUser.designation,
      department: newUser.department,
      role: newUser.role,
      baseSalary: newUser.baseSalary || 0,
      bankDetails: newUser.bankDetails || {},
      isActive: newUser.isActive,
      generatedPassword: plainPassword,
    };
  }

  static async updateStaffByAdmin(
    adminUserId: string,
    staffId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      designation?: string;
      department?: string;
      role?: string;
      baseSalary?: number;
      bankDetails?: any;
      isActive?: boolean;
    }
  ) {
    const user = await User.findById(staffId);
    if (!user) {
      throw { statusCode: 404, message: 'Staff member not found.', code: 'NOT_FOUND' };
    }

    const updated: any = await User.findByIdAndUpdate(
      staffId,
      { $set: data },
      { new: true }
    ).populate('school');

    await AuditService.record({
      actorId: adminUserId,
      action: 'STAFF_UPDATED_BY_ADMIN',
      entity: 'User',
      entityId: staffId,
      metadata: data,
    });

    return {
      id: updated.id,
      employeeId: updated.employeeId,
      name: updated.name,
      email: updated.email || '',
      phone: updated.phone || '',
      designation: updated.designation,
      department: updated.department,
      role: updated.role,
      baseSalary: updated.baseSalary || 0,
      bankDetails: updated.bankDetails || {},
      isActive: updated.isActive,
    };
  }

  static async adminResetPassword(adminUserId: string, staffId: string, customPassword?: string) {
    const user = await User.findById(staffId);
    if (!user) {
      throw { statusCode: 404, message: 'Staff member not found.', code: 'NOT_FOUND' };
    }

    const newPlainPassword = customPassword?.trim() || `Reset@${Math.floor(1000 + Math.random() * 9000)}`;
    const newHash = await hashPassword(newPlainPassword);

    await User.findByIdAndUpdate(staffId, { passwordHash: newHash });
    await RefreshToken.updateMany({ userId: staffId }, { isRevoked: true });

    await AuditService.record({
      actorId: adminUserId,
      action: 'PASSWORD_RESET_BY_ADMIN',
      entity: 'User',
      entityId: staffId,
    });

    return {
      message: 'Password reset successfully.',
      employeeId: user.employeeId,
      name: user.name,
      newPassword: newPlainPassword,
    };
  }

  static async deleteStaff(adminUserId: string, staffId: string) {
    const user = await User.findById(staffId);
    if (!user) {
      throw { statusCode: 404, message: 'Staff member not found.', code: 'NOT_FOUND' };
    }

    await User.findByIdAndDelete(staffId);
    await RefreshToken.deleteMany({ userId: staffId });

    await AuditService.record({
      actorId: adminUserId,
      action: 'STAFF_DELETED',
      entity: 'User',
      entityId: staffId,
      metadata: { employeeId: user.employeeId, name: user.name },
    });

    return { message: `Staff member ${user.name} (${user.employeeId}) deleted successfully.` };
  }
}
