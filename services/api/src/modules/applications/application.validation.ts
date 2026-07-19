import { z } from 'zod';

export const createSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  hostelId: z.string().optional(),
  preferredHostelId: z.string().optional(),
  preferredRoomType: z.string().max(30).optional(),
  reason: z.string().optional(),
});

export const updateSchema = z.object({
  preferredHostelId: z.string().optional(),
  preferredRoomType: z.string().max(30).optional(),
  reason: z.string().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  hostelId: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

export const actionSchema = z.object({
  reviewedBy: z.string().optional(),
  reviewRemarks: z.string().optional(),
});
