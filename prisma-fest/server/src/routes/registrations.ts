import { Router } from 'express';
import { createRegistration, getMyRegistrations, getRegistration, checkinRegistration, stripeWebhook } from '../controllers/registrations';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { createRegistrationSchema } from '../../../shared/schemas/registration';

const router = Router();

router.post('/stripe-webhook', stripeWebhook);
router.post('/', authenticateToken, validate(createRegistrationSchema), createRegistration);
router.get('/mine', authenticateToken, getMyRegistrations);
router.get('/:id', authenticateToken, getRegistration);
router.patch('/:id/checkin', authenticateToken, requireRole('organizer', 'admin'), checkinRegistration);

export { router as registrationRoutes };
