import { z } from 'zod';

export const buildingFormSchema = z.object({
  name: z.string().min(2, 'Building name must be at least 2 characters'),
  code: z.string().min(1, 'Building code is required'),
  hostelId: z.string().min(1, 'Please select a hostel'),
  description: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Co-ed']),
  floors: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 1, 'Floors must be at least 1'),
  capacity: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 1, 'Capacity must be at least 1'),
  status: z.enum(['Active', 'Maintenance']),
  wardenId: z.string().min(1, 'Please select a warden'),
});

export type BuildingFormData = z.input<typeof buildingFormSchema>;
