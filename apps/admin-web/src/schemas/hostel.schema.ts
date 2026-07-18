import { z } from 'zod';

export const hostelFormSchema = z.object({
  name: z.string().min(2, 'Hostel name must be at least 2 characters'),
  type: z.enum(['Boys', 'Girls', 'Mixed']),
  gender: z.enum(['Male', 'Female', 'Co-ed']),
  capacity: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 1, 'Capacity must be at least 1'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  description: z.string().optional(),
  status: z.enum(['Active', 'Maintenance']),
  wardenId: z.string().min(1, 'Please select a warden'),
  floors: z.string().optional(),
  buildings: z.string().optional(),
  facilities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export type HostelFormData = z.input<typeof hostelFormSchema>;
