import { z } from 'zod';

export const createSchema = z.object({
  hostelId: z.string().uuid().nullable().optional(),
  name: z.string().min(1, 'Building name is required').max(100),
  code: z.string().min(1, 'Building code is required').max(30),
  description: z.string().optional(),
  gender: z.string().max(20).optional(),
  floors: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.string().max(20).optional(),
  wardenId: z.string().uuid().optional(),
});

export const updateSchema = z.object({
  hostelId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(30).optional(),
  description: z.string().optional(),
  gender: z.string().max(20).optional(),
  floors: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.string().max(20).optional(),
  wardenId: z.string().uuid().nullable().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  hostelId: z.string().optional(),
  gender: z.string().optional(),
  status: z.string().optional(),
});
