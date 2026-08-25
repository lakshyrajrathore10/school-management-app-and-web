import { Router } from 'express';
import { SalaryController } from '../controllers/salaryController';
import { authenticate } from '../middlewares/auth';
import { authorizeRoles } from '../middlewares/role';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);

// Staff App endpoint: get my salary slips
router.get('/my-slips', SalaryController.getMySalarySlips);

// Get single salary slip detail
router.get('/detail/:id', SalaryController.getSalarySlipById);

// Admin / HR endpoints
router.get('/summary', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.getEmployeeMonthlySummary);
router.get('/summary/all', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.getBulkMonthlySummary);
router.post('/generate', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.generateSalarySlip);
router.post('/generate-bulk', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.generateBulkSalarySlips);
router.get('/all', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.getAllSalarySlips);
router.patch('/:id/status', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.updateSalaryStatus);

// Salary Advance Endpoints (अग्रिम वेतन दर्ज करें)
router.post('/advance', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.recordSalaryAdvance);
router.get('/advance', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.getSalaryAdvances);
router.delete('/advance/:id', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.deleteSalaryAdvance);

// Bank Payout Export Sheet
router.get('/export-payout', authorizeRoles(Role.ADMIN, Role.MANAGER, Role.HR), SalaryController.exportBankPayoutSheet);

export default router;
