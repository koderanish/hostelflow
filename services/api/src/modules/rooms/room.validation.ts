import { z } from 'zod';

export const createSchema = z.object({
  hostelId: z.string().uuid('Hostel is required'),
  buildingId: z.string().uuid().nullable().optional(),
  roomNumber: z.string().min(1, 'Room number is required').max(20),
  floor: z.number().int().optional(),
  roomType: z.string().max(30).optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  status: z.string().max(20).optional(),
});

export const updateSchema = z.object({
  buildingId: z.string().uuid().nullable().optional(),
  roomNumber: z.string().min(1).max(20).optional(),
  floor: z.number().int().optional(),
  roomType: z.string().max(30).optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  status: z.string().max(20).optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  hostelId: z.string().optional(),
  buildingId: z.string().optional(),
  floor: z.string().optional(),
  roomType: z.string().optional(),
  status: z.string().optional(),
});
