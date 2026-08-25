import { Router } from 'express';
import { UploadController } from '../controllers/uploadController';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), UploadController.uploadFile);
router.get('/:filename', UploadController.getFile);

export default router;
