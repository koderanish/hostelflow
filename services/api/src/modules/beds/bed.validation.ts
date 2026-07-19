import { z } from 'zod';

export const createSchema = z.object({
  roomId: z.string().uuid('Room is required'),
  bedNumber: z.string().min(1).max(20),
  status: z.string().max(20).optional(),
});

export const updateSchema = z.object({
  bedNumber: z.string().min(1).max(20).optional(),
  status: z.string().max(20).optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  roomId: z.string().optional(),
  status: z.string().optional(),
  studentId: z.string().optional(),
});
