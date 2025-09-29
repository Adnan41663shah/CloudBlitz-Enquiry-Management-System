import { Router } from 'express';
import { createEnquiry, getEnquiries, getEnquiryById, updateEnquiry, deleteEnquiry, assignEnquiry, unassignEnquiry, getStaffUsers } from '../controllers/enquiryController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Public route for creating enquiries
router.post('/', createEnquiry);

// Protected routes - all authenticated users can view enquiries
router.get('/', authenticate, getEnquiries);

// Admin only routes (before /:id to avoid conflicts)
router.get('/staff/list', authenticate, authorize('admin'), getStaffUsers);
router.post('/:id/assign', authenticate, authorize('admin'), assignEnquiry);
router.post('/:id/unassign', authenticate, authorize('admin'), unassignEnquiry);
router.delete('/:id', authenticate, authorize('admin'), deleteEnquiry);

// Routes with :id parameter
router.get('/:id', authenticate, getEnquiryById);

// Admin and staff can update enquiries (with role-based restrictions in controller)
router.put('/:id', authenticate, authorize('admin', 'staff'), updateEnquiry);

export default router;
