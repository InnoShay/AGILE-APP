import { Router } from 'express';
import { getOverview, getEventAnalytics } from '../controllers/analytics';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

router.get('/overview', authenticateToken, requireRole('admin'), getOverview);
router.get('/events/:id', authenticateToken, requireRole('organizer', 'admin'), getEventAnalytics);

export { router as analyticsRoutes };
