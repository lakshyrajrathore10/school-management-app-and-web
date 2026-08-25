import { Router } from 'express';
import authRoutes from './auth.routes';
import staffRoutes from './staff.routes';
import schoolRoutes from './school.routes';
import attendanceRoutes from './attendance.routes';
import leaveRoutes from './leave.routes';
import holidayRoutes from './holiday.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';
import uploadRoutes from './upload.routes';
import salaryRoutes from './salary.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/staff', staffRoutes);
router.use('/schools', schoolRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/holidays', holidayRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/uploads', uploadRoutes);
router.use('/salary', salaryRoutes);

export default router;
