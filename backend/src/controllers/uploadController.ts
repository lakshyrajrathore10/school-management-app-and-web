import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { ResponseUtil } from '../utils/response';
import { config } from '../config';

export class UploadController {
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ResponseUtil.error(res, 'No file was uploaded.', 'VALIDATION_ERROR', 400);
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      return ResponseUtil.success(
        res,
        {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
        'File uploaded successfully.',
        201
      );
    } catch (error) {
      return next(error);
    }
  }

  static async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const filename = req.params.filename;
      if (!filename) {
        return ResponseUtil.error(res, 'Filename is required.', 'VALIDATION_ERROR', 400);
      }
      const safeFilename = path.basename(filename);
      const filepath = path.resolve(config.uploads.directory, safeFilename);

      if (!fs.existsSync(filepath)) {
        return ResponseUtil.error(res, 'File not found.', 'NOT_FOUND', 404);
      }

      return res.sendFile(filepath);
    } catch (error) {
      return next(error);
    }
  }
}
