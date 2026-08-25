import { AuditLog } from '../models';
import { logger } from '../utils/logger';

export interface AuditLogOptions {
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async record(options: AuditLogOptions): Promise<void> {
    try {
      await AuditLog.create({
        actorId: options.actorId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        metadata: options.metadata || {},
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      });
    } catch (error) {
      logger.error('Failed to create audit log: %o', error);
      // Non-blocking for primary application flow
    }
  }
}
