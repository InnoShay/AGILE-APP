import { Router } from 'express';
import { getMyNotifications, markAllRead, markOneRead } from '../controllers/notifications';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/mine', authenticateToken, getMyNotifications);
router.patch('/read-all', authenticateToken, markAllRead);
router.patch('/:id/read', authenticateToken, markOneRead);

export { router as notificationRoutes };
