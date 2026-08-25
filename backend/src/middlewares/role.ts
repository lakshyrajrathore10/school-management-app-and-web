import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { Role } from '../types/enums';

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.error(
        res,
        'Authentication required.',
        'UNAUTHORIZED',
        401
      );
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return ResponseUtil.error(
        res,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        'FORBIDDEN',
        403
      );
    }

    return next();
  };
}
