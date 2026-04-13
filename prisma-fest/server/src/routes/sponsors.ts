import { Router } from 'express';
import { listSponsors, createSponsor, deleteSponsor } from '../controllers/sponsors';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { createSponsorSchema } from '../../../shared/schemas/sponsor';

const router = Router();

router.get('/', listSponsors);
router.post('/', authenticateToken, requireRole('admin'), validate(createSponsorSchema), createSponsor);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteSponsor);

export { router as sponsorRoutes };
