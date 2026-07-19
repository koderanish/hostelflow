import { z } from 'zod';

export const createSchema = z.object({
  studentId: z.string().uuid('Student is required'),
  roomId: z.string().uuid('Room is required'),
  bedId: z.string().uuid('Bed is required').optional(),
  applicationId: z.string().uuid().optional(),
  allocatedDate: z.string().optional(),
  expectedVacateDate: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
});

export const updateSchema = z.object({
  status: z.string().max(20).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  expectedVacateDate: z.string().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  studentId: z.string().optional(),
  roomId: z.string().optional(),
  bedId: z.string().optional(),
  status: z.string().optional(),
});

export const transferSchema = z.object({
  roomId: z.string().uuid('Target room is required'),
  bedId: z.string().uuid('Target bed is required').optional(),
});
