import { Router } from 'express';
import { getSchedule, createScheduleSlot, updateScheduleSlot, deleteScheduleSlot } from '../controllers/schedule';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { createScheduleSchema, updateScheduleSchema } from '../../../shared/schemas/schedule';

const router = Router();

router.get('/', getSchedule);
router.post('/', authenticateToken, requireRole('organizer', 'admin'), validate(createScheduleSchema), createScheduleSlot);
router.put('/:id', authenticateToken, requireRole('organizer', 'admin'), validate(updateScheduleSchema), updateScheduleSlot);
router.delete('/:id', authenticateToken, requireRole('organizer', 'admin'), deleteScheduleSlot);

export { router as scheduleRoutes };
