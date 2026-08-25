import { Router } from 'express';
import { SchoolController } from '../controllers/schoolController';
import { authenticate } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

router.get('/config', SchoolController.getConfig);
router.put('/config', authorizeRoles(Role.ADMIN, Role.MANAGER), SchoolController.updateConfig);
router.patch('/config', authorizeRoles(Role.ADMIN, Role.MANAGER), SchoolController.updateConfig);

export default router;

