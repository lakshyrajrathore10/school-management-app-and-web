import { Router } from 'express';
import { LeaveController } from '../controllers/leaveController';
import { authenticate } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

router.get('/', LeaveController.getLeaveList);
router.post('/', LeaveController.applyLeave);
router.get('/quotas', LeaveController.getQuotas);
router.get('/:id', LeaveController.getDetail);
router.patch('/:id/cancel', LeaveController.cancelLeave);

// Admin / Manager Review Endpoints
router.get('/admin/all', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), LeaveController.getAllLeaveRequests);
router.patch('/:id/approve', authorizeRoles(Role.ADMIN, Role.MANAGER), LeaveController.approveLeave);
router.patch('/:id/reject', authorizeRoles(Role.ADMIN, Role.MANAGER), LeaveController.rejectLeave);

export default router;

