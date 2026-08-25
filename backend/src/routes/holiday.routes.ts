import { Router } from 'express';
import { HolidayController } from '../controllers/holidayController';
import { authenticate } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

router.get('/', HolidayController.getHolidays);
router.post('/', authorizeRoles(Role.ADMIN, Role.MANAGER), HolidayController.createHoliday);
router.get('/:id', HolidayController.getDetail);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.MANAGER), HolidayController.updateHoliday);
router.patch('/:id', authorizeRoles(Role.ADMIN, Role.MANAGER), HolidayController.updateHoliday);
router.delete('/:id', authorizeRoles(Role.ADMIN), HolidayController.deleteHoliday);

export default router;

