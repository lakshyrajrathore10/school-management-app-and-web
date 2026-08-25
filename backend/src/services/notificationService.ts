import { Notification, User } from '../models';
import { NotificationType } from '../types/enums';

export class NotificationService {
  private static formatReadableDate(date: Date): { timestamp: string; date: string } {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;

    return {
      timestamp: timeStr,
      date: dateStr,
    };
  }

  static async getNotifications(userId: string) {
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    return notifications.map(n => {
      const formatted = this.formatReadableDate(n.createdAt);
      return {
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        isRead: n.isRead,
        timestamp: formatted.timestamp,
        date: formatted.date,
        createdAt: n.createdAt.toISOString(),
      };
    });
  }

  static async markAsRead(id: string, userId: string) {
    const updated = await Notification.updateOne(
      { _id: id, userId },
      { $set: { isRead: true } }
    );

    if (updated.matchedCount === 0) {
      throw { statusCode: 404, message: 'Notification not found.', code: 'NOT_FOUND' };
    }

    return { message: 'Notification marked as read.' };
  }

  static async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return { message: 'All notifications marked as read.' };
  }

  static async deleteNotification(id: string, userId: string) {
    const deleted = await Notification.deleteOne({ _id: id, userId });

    if (deleted.deletedCount === 0) {
      throw { statusCode: 404, message: 'Notification not found.', code: 'NOT_FOUND' };
    }

    return { message: 'Notification deleted successfully.' };
  }

  // ============================================================
  // ADMIN BROADCAST METHOD
  // ============================================================

  static async broadcastNotification(
    schoolId: string,
    payload: {
      title: string;
      body: string;
      type?: string;
      targetRole?: string;
      targetDepartment?: string;
    }
  ) {
    const userQuery: any = { schoolId, isActive: true };
    if (payload.targetRole) {
      userQuery.role = payload.targetRole;
    }
    if (payload.targetDepartment) {
      userQuery.department = payload.targetDepartment;
    }

    const users = await User.find(userQuery).select('_id');
    if (users.length === 0) {
      throw { statusCode: 404, message: 'No target users found for this notification.', code: 'NO_TARGET_USERS' };
    }

    const notifType = payload.type || NotificationType.GENERAL_CIRCULAR;
    const notificationsToCreate = users.map(user => ({
      userId: user._id,
      title: payload.title.trim(),
      body: payload.body.trim(),
      type: notifType,
      isRead: false,
    }));

    await Notification.insertMany(notificationsToCreate);

    return {
      message: `Notification broadcasted to ${users.length} staff member(s).`,
      count: users.length,
      title: payload.title,
      type: notifType,
    };
  }
}

