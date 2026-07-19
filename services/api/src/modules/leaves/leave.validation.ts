import { z } from 'zod';

export const createSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  leaveType: z.string().optional(),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  reason: z.string().min(1, 'Reason is required'),
  remarks: z.string().optional(),
});

export const updateSchema = z.object({
  leaveType: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  reason: z.string().optional(),
  remarks: z.string().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  leaveType: z.string().optional(),
  studentId: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

export const actionSchema = z.object({
  approvedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export const rejectSchema = z.object({
  approvedBy: z.string().optional(),
  remarks: z.string().min(1, 'Remarks are required for rejection'),
});
