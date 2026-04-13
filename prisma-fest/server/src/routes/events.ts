/**
 * Events routes — public listing/detail, organizer CRUD, admin management.
 */

import { Router } from 'express';
import multer from 'multer';
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent, cancelEvent, getEventRegistrations } from '../controllers/events';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../../../shared/schemas/event';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Public routes ───
router.get('/', listEvents);
router.get('/:id', getEvent);

// ─── Organizer routes ───
router.post('/', authenticateToken, requireRole('organizer', 'admin'), validate(createEventSchema), createEvent);
router.put('/:id', authenticateToken, requireRole('organizer', 'admin'), updateEvent);
router.delete('/:id', authenticateToken, requireRole('organizer', 'admin'), deleteEvent);
router.patch('/:id/cancel', authenticateToken, requireRole('organizer', 'admin'), cancelEvent);
router.get('/:id/registrations', authenticateToken, requireRole('organizer', 'admin'), getEventRegistrations);

export { router as eventRoutes };
