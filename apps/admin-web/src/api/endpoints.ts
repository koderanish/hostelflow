import { API_BASE_URL } from '../constants';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  STUDENTS: {
    BASE: `${API_BASE_URL}/students`,
    BY_ID: (id: string) => `${API_BASE_URL}/students/${id}`,
    DOCUMENTS: (id: string) => `${API_BASE_URL}/students/${id}/documents`,
  },
  HOSTELS: {
    BASE: `${API_BASE_URL}/hostels`,
    BY_ID: (id: string) => `${API_BASE_URL}/hostels/${id}`,
    BUILDINGS: (id: string) => `${API_BASE_URL}/hostels/${id}/buildings`,
    FACILITIES: (id: string) => `${API_BASE_URL}/hostels/${id}/facilities`,
    ROOMS: (id: string) => `${API_BASE_URL}/hostels/${id}/rooms`,
  },
  BUILDINGS: {
    BASE: `${API_BASE_URL}/buildings`,
    BY_ID: (id: string) => `${API_BASE_URL}/buildings/${id}`,
  },
  ROOMS: {
    BASE: `${API_BASE_URL}/rooms`,
    BY_ID: (id: string) => `${API_BASE_URL}/rooms/${id}`,
    BEDS: (id: string) => `${API_BASE_URL}/rooms/${id}/beds`,
    TRANSFER: (id: string) => `${API_BASE_URL}/rooms/${id}/transfer`,
    HISTORY: (id: string) => `${API_BASE_URL}/rooms/${id}/history`,
  },
  APPLICATIONS: {
    BASE: `${API_BASE_URL}/applications`,
    BY_ID: (id: string) => `${API_BASE_URL}/applications/${id}`,
  },
  ALLOCATIONS: {
    BASE: `${API_BASE_URL}/allocations`,
    BY_ID: (id: string) => `${API_BASE_URL}/allocations/${id}`,
    AUTO: `${API_BASE_URL}/allocations/auto`,
    HISTORY: (id: string) => `${API_BASE_URL}/allocations/${id}/history`,
  },
  FEES: {
    BASE: `${API_BASE_URL}/fees`,
    BY_ID: (id: string) => `${API_BASE_URL}/fees/${id}`,
    STRUCTURE: `${API_BASE_URL}/fees/structure`,
    INVOICES: `${API_BASE_URL}/fees/invoices`,
    RECEIPTS: `${API_BASE_URL}/fees/receipts`,
    GENERATE: `${API_BASE_URL}/fees/generate`,
  },
  ATTENDANCE: {
    BASE: `${API_BASE_URL}/attendance`,
    TODAY: `${API_BASE_URL}/attendance/today`,
    BY_DATE: (date: string) => `${API_BASE_URL}/attendance/date/${date}`,
    BY_STUDENT: (id: string) => `${API_BASE_URL}/attendance/student/${id}`,
    CALENDAR: `${API_BASE_URL}/attendance/calendar`,
  },
  LEAVE: {
    BASE: `${API_BASE_URL}/leave`,
    BY_ID: (id: string) => `${API_BASE_URL}/leave/${id}`,
  },
  VISITORS: {
    BASE: `${API_BASE_URL}/visitors`,
    BY_ID: (id: string) => `${API_BASE_URL}/visitors/${id}`,
  },
  COMPLAINTS: {
    BASE: `${API_BASE_URL}/complaints`,
    BY_ID: (id: string) => `${API_BASE_URL}/complaints/${id}`,
    COMMENTS: (id: string) => `${API_BASE_URL}/complaints/${id}/comments`,
  },
  MESS: {
    MENU: `${API_BASE_URL}/mess/menu`,
    ATTENDANCE: `${API_BASE_URL}/mess/attendance`,
    FEEDBACK: `${API_BASE_URL}/mess/feedback`,
    SPECIAL: `${API_BASE_URL}/mess/special`,
  },
  INVENTORY: {
    BASE: `${API_BASE_URL}/inventory`,
    BY_ID: (id: string) => `${API_BASE_URL}/inventory/${id}`,
    SUPPLIERS: `${API_BASE_URL}/inventory/suppliers`,
    ISSUES: `${API_BASE_URL}/inventory/issues`,
  },
  STAFF: {
    BASE: `${API_BASE_URL}/staff`,
    BY_ID: (id: string) => `${API_BASE_URL}/staff/${id}`,
  },
  NOTICES: {
    BASE: `${API_BASE_URL}/notices`,
    BY_ID: (id: string) => `${API_BASE_URL}/notices/${id}`,
  },
  REPORTS: {
    ATTENDANCE: `${API_BASE_URL}/reports/attendance`,
    FEES: `${API_BASE_URL}/reports/fees`,
    COMPLAINTS: `${API_BASE_URL}/reports/complaints`,
    OCCUPANCY: `${API_BASE_URL}/reports/occupancy`,
    VISITORS: `${API_BASE_URL}/reports/visitors`,
    INVENTORY: `${API_BASE_URL}/reports/inventory`,
    REVENUE: `${API_BASE_URL}/reports/revenue`,
  },
  SETTINGS: {
    INSTITUTE: `${API_BASE_URL}/settings/institute`,
    HOSTEL: `${API_BASE_URL}/settings/hostel`,
    SMTP: `${API_BASE_URL}/settings/smtp`,
    CLOUDINARY: `${API_BASE_URL}/settings/cloudinary`,
    RAZORPAY: `${API_BASE_URL}/settings/razorpay`,
  },
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
  },
  DASHBOARD: {
    ADMIN: `${API_BASE_URL}/dashboard/admin`,
    WARDEN: `${API_BASE_URL}/dashboard/warden`,
    STAFF: `${API_BASE_URL}/dashboard/staff`,
    STUDENT: `${API_BASE_URL}/dashboard/student`,
  },
} as const;
