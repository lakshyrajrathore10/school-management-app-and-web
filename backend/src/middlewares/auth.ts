import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseUtil.error(
      res,
      'Authentication token is required.',
      'UNAUTHORIZED',
      401
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    req.token = token;
    return next();
  } catch (error: any) {
    return ResponseUtil.error(
      res,
      'Invalid or expired authentication token.',
      'UNAUTHORIZED',
      401
    );
  }
}
