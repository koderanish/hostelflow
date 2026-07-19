import { z } from 'zod';

export const createSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  name: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.string().optional(),
  roleId: z.string().uuid().optional(),
  status: z.boolean().optional(),
});

export const updateSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  roleId: z.string().uuid().optional(),
  status: z.boolean().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});
