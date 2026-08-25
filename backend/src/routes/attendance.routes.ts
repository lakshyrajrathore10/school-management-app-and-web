import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController';
import { authenticate } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

router.get('/today', AttendanceController.getTodayStatus);
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);
router.get('/history', AttendanceController.getHistory);

// Admin Routes
router.get('/admin/all', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), AttendanceController.getAllAttendance);
router.patch('/admin/:id/override', authorizeRoles(Role.ADMIN, Role.MANAGER), AttendanceController.overrideAttendance);

router.get('/:id', AttendanceController.getDetail);

export default router;

