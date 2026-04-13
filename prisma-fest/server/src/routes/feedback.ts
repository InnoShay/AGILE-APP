import { Router } from 'express';
import { createFeedback, getEventFeedback } from '../controllers/feedback';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createFeedbackSchema } from '../../../shared/schemas/feedback';

const router = Router();

router.post('/', authenticateToken, validate(createFeedbackSchema), createFeedback);
router.get('/event/:id', getEventFeedback);

export { router as feedbackRoutes };
