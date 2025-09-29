import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'staff', 'user']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required')
});

// Enquiry validation schemas
export const createEnquirySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name cannot exceed 100 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number cannot exceed 20 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters')
});

export const updateEnquirySchema = z.object({
  status: z.enum(['new', 'in_progress', 'closed']).optional(),
  assignedTo: z.string().optional()
});

export const enquiryQuerySchema = z.object({
  status: z.string().optional().refine(val => !val || ['new', 'in_progress', 'closed'].includes(val), {
    message: 'Status must be one of: new, in_progress, closed'
  }),
  search: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;
export type EnquiryQueryInput = z.infer<typeof enquiryQuerySchema>;
