import { Router } from 'express';
import { StaffController } from '../controllers/staffController';
import { authenticate } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

// User self profile routes
router.get('/profile', StaffController.getProfile);
router.patch('/profile', StaffController.updateProfile);
router.post('/change-password', StaffController.changePassword);

// Admin staff management routes
router.get('/', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), StaffController.getAllStaff);
router.post('/', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), StaffController.createStaff);
router.patch('/:id', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), StaffController.updateStaffByAdmin);
router.post('/:id/reset-password', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), StaffController.resetPasswordByAdmin);
router.delete('/:id', authorizeRoles(Role.ADMIN), StaffController.deleteStaff);

export default router;

