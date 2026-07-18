export const APP_NAME = 'HostelFlow';
export const API_BASE_URL = 'http://localhost:5000/api';
export const MOCK_DELAY = 400;

export const STORAGE_KEYS = {
  USER: 'hostelflow_user',
  THEME: 'hostelflow_theme',
  REMEMBER_ME: 'hostelflow_remember',
  SESSION_EXPIRY: 'hostelflow_session',
} as const;

export const ROLES = {
  ADMIN: 'admin' as const,
  WARDEN: 'warden' as const,
  STAFF: 'staff' as const,
  STUDENT: 'student' as const,
};

export const FEE_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  PARTIAL: 'Partial',
  OVERDUE: 'Overdue',
  REFUND: 'Refund',
} as const;

export const APPLICATION_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ALLOCATED: 'Allocated',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  HALF_DAY: 'Half-Day',
} as const;

export const COMPLAINT_STATUS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
} as const;

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

export const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export const ALLOCATION_STATUS = {
  ACTIVE: 'Active',
  TRANSFERRED: 'Transferred',
  VACATED: 'Vacated',
} as const;

export const ROOM_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  UNDER_MAINTENANCE: 'Under Maintenance',
} as const;

export const VISITOR_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  CHECKED_OUT: 'Checked Out',
} as const;

export const NOTIFICATION_TYPES = {
  FEE_DUE: 'Fee Due',
  ROOM_ALLOCATION: 'Room Allocation',
  COMPLAINT_RESOLVED: 'Complaint Resolved',
  LEAVE_APPROVED: 'Leave Approved',
  LEAVE_REJECTED: 'Leave Rejected',
  MESS_MENU: 'Mess Menu',
  EMERGENCY: 'Emergency',
  GENERAL: 'General',
  VISITOR: 'Visitor',
  ATTENDANCE: 'Attendance',
} as const;

export const FEES_PER_PAGE = 10;
export const TABLE_PAGE_SIZES = [5, 10, 25, 50, 100];

export const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  orange: '#f97316',
  slate: '#64748b',
};

export const DOCUMENT_CATEGORY = {
  ID_PROOF: 'ID Proof',
  ADMISSION_LETTER: 'Admission Letter',
  FEE_RECEIPT: 'Fee Receipt',
  LEAVE_DOCUMENT: 'Leave Document',
  OTHER: 'Other',
} as const;

export const EMERGENCY_TYPE = {
  FIRE: 'Fire',
  MEDICAL: 'Medical',
  SECURITY: 'Security',
  OTHER: 'Other',
} as const;

export const FACILITY_TYPE = {
  LAUNDRY: 'Laundry',
  GYM: 'Gym',
  COMMON_ROOM: 'Common Room',
  LIBRARY: 'Library',
  KITCHEN: 'Kitchen',
  PARKING: 'Parking',
  OTHER: 'Other',
} as const;

export const FACILITY_STATUS = {
  AVAILABLE: 'Available',
  UNDER_MAINTENANCE: 'Under Maintenance',
} as const;

export const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@hostelflow.com', password: 'admin123', icon: 'Shield' },
  { role: 'Warden', email: 'warden@hostelflow.com', password: 'warden123', icon: 'Users' },
  { role: 'Staff', email: 'staff@hostelflow.com', password: 'staff123', icon: 'Users' },
  { role: 'Student', email: 'student@hostelflow.com', password: 'student123', icon: 'GraduationCap' },
];
