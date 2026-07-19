import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(6).optional(),
  registrationNo: z.string().optional(),
  enrollmentNo: z.string().optional(),
  course: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  semester: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      if (date > new Date()) return false;
      const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 15 && age <= 100;
    },
    { message: 'Date of birth must be a valid past date with age between 15 and 100 years' }
  ),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  status: z.string().optional(),
  feeStatus: z.string().optional(),
  admissionDate: z.string().optional(),
});

export const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  registrationNo: z.string().optional(),
  enrollmentNo: z.string().optional(),
  course: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  semester: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      if (date > new Date()) return false;
      const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 15 && age <= 100;
    },
    { message: 'Date of birth must be a valid past date with age between 15 and 100 years' }
  ),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  status: z.string().optional(),
  feeStatus: z.string().optional(),
  admissionDate: z.string().optional(),
});

export const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  gender: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  feeStatus: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});
