import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ResponseUtil } from '../utils/response';

export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.reduce((acc: any, curr: any) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {});

        return ResponseUtil.error(
          res,
          'Validation failed for request payload.',
          'VALIDATION_ERROR',
          400,
          details
        );
      }
      return next(error);
    }
  };
}
