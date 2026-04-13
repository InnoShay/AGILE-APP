import { Router } from 'express';
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcements';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { createAnnouncementSchema } from '../../../shared/schemas/announcement';

const router = Router();

router.get('/', listAnnouncements);
router.post('/', authenticateToken, requireRole('admin'), validate(createAnnouncementSchema), createAnnouncement);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteAnnouncement);

export { router as announcementRoutes };
