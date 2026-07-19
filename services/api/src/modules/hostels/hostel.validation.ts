import { z } from 'zod';

export const createSchema = z.object({
  hostelName: z.string().min(1, 'Hostel name is required').max(100),
  hostelType: z.string().max(20).optional(),
  gender: z.string().max(20).optional(),
  capacity: z.number().int().positive().optional(),
  floors: z.number().int().positive().optional(),
  address: z.string().optional(),
  wardenId: z.string().uuid().optional(),
});

export const updateSchema = z.object({
  hostelName: z.string().min(1).max(100).optional(),
  hostelType: z.string().max(20).optional(),
  gender: z.string().max(20).optional(),
  capacity: z.number().int().positive().optional(),
  floors: z.number().int().positive().optional(),
  address: z.string().optional(),
  wardenId: z.string().uuid().nullable().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  gender: z.string().optional(),
});
