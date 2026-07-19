import { z } from 'zod';

export const createSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  roomId: z.string().optional(),
  roomNo: z.string().optional(),
  category: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
});

export const updateSchema = z.object({
  category: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.string().optional(),
  roomId: z.string().optional(),
  roomNo: z.string().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

export const assignSchema = z.object({
  staffId: z.string().min(1),
  staffName: z.string().min(1),
});

export const resolveSchema = z.object({
  resolutionNotes: z.string().min(1, 'Resolution notes are required'),
});

export const rejectSchema = z.object({
  remarks: z.string().min(1, 'Remarks are required'),
});
