import { Router } from 'express';
import { createUser, getUsers, updateUser, updateUserRole, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// All user routes require admin access
router.post('/', authenticate, authorize('admin'), createUser);
router.get('/', authenticate, authorize('admin'), getUsers);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.put('/:id/role', authenticate, authorize('admin'), updateUserRole);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
