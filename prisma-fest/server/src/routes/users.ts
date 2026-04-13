/**
 * Users routes — profile and admin user management.
 */

import { Router } from 'express';
import multer from 'multer';
import { getMe, updateMe, deleteMe, uploadAvatar, changePassword, getUserById, listUsers, updateUserRole, toggleBan } from '../controllers/users';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { validate } from '../middleware/validate';
import { updateUserSchema, changePasswordSchema } from '../../../shared/schemas/user';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Authenticated user routes ───
router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, validate(updateUserSchema), updateMe);
router.delete('/me', authenticateToken, deleteMe);
router.post('/me/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);
router.put('/me/password', authenticateToken, validate(changePasswordSchema), changePassword);

// ─── Admin routes ───
router.get('/', authenticateToken, requireRole('admin'), listUsers);
router.get('/:id', authenticateToken, requireRole('admin'), getUserById);
router.patch('/:id/role', authenticateToken, requireRole('admin'), updateUserRole);
router.patch('/:id/ban', authenticateToken, requireRole('admin'), toggleBan);

export { router as userRoutes };
