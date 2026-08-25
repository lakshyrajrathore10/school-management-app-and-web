import { User, RefreshToken } from '../models';
import { verifyPassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { AuditService } from './auditService';

export class AuthService {
  static async login(employeeId?: string, password?: string, clientInfo?: { ip?: string; userAgent?: string }) {
    if (!employeeId || !password || typeof employeeId !== 'string' || typeof password !== 'string') {
      throw { statusCode: 400, message: 'Employee ID and password are required.', code: 'VALIDATION_ERROR' };
    }

    let user;
    try {
      user = await User.findOne({ employeeId: employeeId.trim() }).populate('school');
    } catch (dbErr) {
      throw { statusCode: 401, message: 'Invalid employee ID or account is inactive.', code: 'INVALID_CREDENTIALS' };
    }

    if (!user || !user.isActive) {
      throw { statusCode: 401, message: 'Invalid employee ID or account is inactive.', code: 'INVALID_CREDENTIALS' };
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Invalid credentials provided.', code: 'INVALID_CREDENTIALS' };
    }

    const payload = {
      userId: user.id,
      employeeId: user.employeeId,
      role: user.role,
      schoolId: user.schoolId.toString(),
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token hash to DB
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
      await RefreshToken.create({
        userId: user._id,
        tokenHash: refreshTokenHash,
        expiresAt,
      });

      await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    } catch (err) {
      // Non-blocking fallback
    }

    await AuditService.record({
      actorId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    });

    const userProfile = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email || '',
      phone: user.phone || undefined,
      designation: user.designation || 'Staff Member',
      department: user.department || 'Academics',
      schoolName: user.school?.name || '',
      schoolId: user.schoolId.toString(),
      role: user.role,
      avatarUrl: user.avatarUrl || undefined,
    };

    return {
      token,
      refreshToken,
      user: userProfile,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  static async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token.', code: 'INVALID_REFRESH_TOKEN' };
    }

    const tokenHash = hashToken(refreshToken);
    let storedToken: any;
    try {
      storedToken = await RefreshToken.findOne({ tokenHash }).populate({
        path: 'userId',
        populate: { path: 'school' },
      });
    } catch (err) {
      throw { statusCode: 401, message: 'Refresh token has been revoked or expired.', code: 'REVOKED_REFRESH_TOKEN' };
    }

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date() || !storedToken.userId) {
      throw { statusCode: 401, message: 'Refresh token has been revoked or expired.', code: 'REVOKED_REFRESH_TOKEN' };
    }

    const user = storedToken.userId;

    // Revoke current token (rotation)
    try {
      await RefreshToken.findByIdAndUpdate(storedToken._id, { isRevoked: true });
    } catch (err) {}

    const newPayload = {
      userId: user.id,
      employeeId: user.employeeId,
      role: user.role,
      schoolId: user.schoolId.toString(),
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    try {
      await RefreshToken.create({
        userId: user._id,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (err) {}

    const userProfile = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email || '',
      phone: user.phone || undefined,
      designation: user.designation || 'Staff Member',
      department: user.department || 'Academics',
      schoolName: user.school?.name || '',
      schoolId: user.schoolId.toString(),
      role: user.role,
      avatarUrl: user.avatarUrl || undefined,
    };

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: userProfile,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  static async logout(userId: string, refreshToken?: string, clientInfo?: { ip?: string; userAgent?: string }) {
    try {
      if (refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await RefreshToken.updateMany({ userId, tokenHash }, { isRevoked: true });
      } else {
        await RefreshToken.updateMany({ userId }, { isRevoked: true });
      }
    } catch (err) {}

    await AuditService.record({
      actorId: userId,
      action: 'LOGOUT',
      entity: 'User',
      entityId: userId,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    });

    return { message: 'Logged out successfully.' };
  }
}
