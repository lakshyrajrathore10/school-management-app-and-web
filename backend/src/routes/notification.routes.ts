import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.post('/send', authorizeRoles(Role.ADMIN, Role.MANAGER), NotificationController.broadcastNotification);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;

