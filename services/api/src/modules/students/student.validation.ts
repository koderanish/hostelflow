import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6).optional(),
  enrollmentNo: z.string().optional(),
  course: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  status: z.string().optional(),
});

export const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  enrollmentNo: z.string().optional(),
  course: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  status: z.string().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  gender: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});
