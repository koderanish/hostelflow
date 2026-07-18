export type UserRole = 'student' | 'warden' | 'staff' | 'admin';

export type ThemeMode = 'light' | 'dark' | 'system';

export type CreateEntity<T> = Omit<T, 'id'>;
export type UpdateEntity<T> = Partial<T>;

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  sessionExpiry?: string;
}

export interface Building {
  id: string;
  hostelId: string;
  name: string;
  code: string;
  description?: string;
  gender: 'Male' | 'Female' | 'Co-ed';
  floors: number;
  capacity: number;
  occupiedRooms: number;
  availableRooms: number;
  status: 'Active' | 'Maintenance';
  wardenId: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  id: string;
  hostelId: string;
  name: string;
  type: 'Laundry' | 'Gym' | 'Common Room' | 'Library' | 'Kitchen' | 'Parking' | 'Other';
  status: 'Available' | 'Under Maintenance';
  timings?: string;
}

export interface Student {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  bloodGroup?: string;
  address: string;
  enrollmentNo: string;
  registrationNo?: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  parentName: string;
  parentContact: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation?: string;
  hostelId?: string;
  roomId?: string;
  roomNo?: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  feeStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  isDeleted?: boolean;
  admissionDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentDocument {
  id: string;
  studentId: string;
  studentName: string;
  fileName: string;
  type: 'Aadhaar' | 'PAN' | 'Passport' | 'Admission Letter' | 'Fee Receipt' | 'Medical Certificate' | 'Other';
  status: 'Pending' | 'Verified' | 'Rejected';
  fileUrl?: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type StudentEventType =
  | 'Created'
  | 'Updated'
  | 'StatusChanged'
  | 'Allocated'
  | 'Vacated'
  | 'DocumentUploaded'
  | 'DocumentVerified';

export interface StudentEvent {
  id: string;
  studentId: string;
  eventType: StudentEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

export interface Hostel {
  id: string;
  name: string;
  type: 'Boys' | 'Girls' | 'Mixed';
  gender: 'Male' | 'Female' | 'Co-ed';
  capacity: number;
  occupied: number;
  address: string;
  description?: string;
  wardenId: string;
  wardenName: string;
  status: 'Active' | 'Maintenance';
  floors: number;
  buildings: number;
  facilities: string[];
  images?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bed {
  id: string;
  roomId: string;
  bedNo: string;
  status: 'Available' | 'Occupied' | 'Under Maintenance';
  studentId?: string;
}

export interface Room {
  id: string;
  hostelId: string;
  buildingId: string;
  roomNo: string;
  floor: number;
  roomType: 'Single' | 'Double' | 'Triple' | 'Dormitory';
  status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Reserved';
  amenities: string[];
  price: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoomEventType =
  | 'Created'
  | 'StatusChanged'
  | 'Allocated'
  | 'Vacated'
  | 'Transferred'
  | 'Reserved'
  | 'ReservationCancelled'
  | 'MaintenanceStarted'
  | 'MaintenanceCompleted';

export interface RoomEvent {
  id: string;
  roomId: string;
  eventType: RoomEventType;
  timestamp: string;
  performedBy?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

export type BedEventType =
  | 'Created'
  | 'StatusChanged'
  | 'Allocated'
  | 'Vacated';

export interface BedEvent {
  id: string;
  bedId: string;
  roomId: string;
  eventType: BedEventType;
  timestamp: string;
  performedBy?: string;
  studentId?: string;
  previousStatus?: string;
  newStatus?: string;
  details?: string;
}

export interface HostelApplication {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  year: string;
  preferredHostelId: string;
  preferredHostel: string;
  preferredRoomType: string;
  academicYear: string;
  semester: string;
  reason?: string;
  specialRequirements?: string;
  medicalRequirements?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Waitlisted' | 'Cancelled';
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewRemarks?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAllocation {
  id: string;
  studentId: string;
  studentName: string;
  hostelId: string;
  hostelName: string;
  roomId: string;
  roomNo: string;
  bedId?: string;
  bedNo?: string;
  buildingId?: string;
  applicationId?: string;
  dateAllocated: string;
  expectedVacateDate?: string;
  dateVacated?: string;
  status: 'Active' | 'Transferred' | 'Vacated' | 'Cancelled';
  transferHistory?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeStructure {
  id: string;
  feeType: 'Hostel Fee' | 'Mess Fee' | 'Security Deposit' | 'Maintenance Charges' | 'Other';
  amount: number;
  frequency: 'Monthly' | 'Semesterly' | 'Yearly' | 'One Time';
  hostelId?: string;
  isActive: boolean;
}

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  feeType: 'Hostel Fee' | 'Mess Fee' | 'Security Deposit' | 'Maintenance Charges';
  feeStructureId?: string;
  amount: number;
  paidAmount?: number;
  balance?: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Partial' | 'Overdue' | 'Refund';
  paidDate?: string;
  paymentMethod?: 'UPI' | 'Debit Card' | 'Credit Card' | 'Net Banking' | 'Cash';
  transactionId?: string;
  invoiceId?: string;
  receiptNo?: string;
  lateFee?: number;
  allocationId?: string;
  period?: string;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  invoiceNo: string;
  items: { description: string; amount: number }[];
  totalAmount: number;
  dueDate: string;
  status: 'Generated' | 'Sent' | 'Paid' | 'Overdue';
  generatedDate: string;
}

export interface Receipt {
  id: string;
  invoiceId: string;
  studentId: string;
  receiptNo: string;
  amount: number;
  paymentMethod: 'UPI' | 'Debit Card' | 'Credit Card' | 'Net Banking' | 'Cash';
  transactionId?: string;
  paidDate: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields
  type?: 'Check-In' | 'Check-Out' | 'Daily';
  time?: string;
  method?: 'QR Code' | 'Biometric' | 'Manual';
  markedBy?: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  leaveType: 'Medical' | 'Personal' | 'Family' | 'Emergency' | 'Other';
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approvedBy?: string;
  reviewedDate?: string;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields
  destination?: string;
  parentApproved?: boolean;
  isEmergency?: boolean;
  contactDuringLeave?: string;
  dateApplied?: string;
  reviewedBy?: string;
  reviewDate?: string;
}

export interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  idProofType?: string;
  idProofNo?: string;
  studentId: string;
  studentName: string;
  relation: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  purpose?: string;
  status: 'Pending' | 'Approved' | 'Checked In' | 'Checked Out' | 'Rejected' | 'Cancelled';
  approvedBy?: string;
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields
  email?: string;
  inTime?: string;
  outTime?: string;
  idProof?: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  category: 'Electrical' | 'Plumbing' | 'Cleaning' | 'Internet' | 'Furniture' | 'Other';
  roomId: string;
  roomNo: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
  assignedTo?: string;
  assignedToName?: string;
  dateAdded: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy
  timeline?: { date: string; action: string; by: string }[];
}

export interface MessMenu {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  special?: string;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealAttendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  status: 'Present' | 'Absent' | 'Excused';
  remarks?: string;
}

export interface MealRequest {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  items: string;
  reason: string;
  dietaryPreference?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DietaryPreference {
  id: string;
  studentId: string;
  preference: string;
  isActive: boolean;
}

export interface MessFeedback {
  id: string;
  studentId: string;
  meal: string;
  rating: number;
  comment: string;
  date: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Electrical' | 'Cleaning' | 'Kitchen' | 'Stationery' | 'Other';
  sku?: string;
  quantity: number;
  availableQuantity: number;
  unit: string;
  condition: 'New' | 'Good' | 'Damaged' | 'Repair';
  location: string;
  assignedTo?: string;
  purchaseDate?: string;
  vendor?: string;
  cost?: number;
  status: 'Available' | 'Issued' | 'Low Stock' | 'Out of Stock';
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields
  minQuantity?: number;
  hostelId?: string;
  supplierId?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  category: string;
  isActive: boolean;
}

export interface InventoryIssue {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  issuedTo: string;
  issuedBy: string;
  issueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Lost';
  purpose: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Fee Due' | 'Room Allocation' | 'Complaint Resolved' | 'Leave Approved' | 'Leave Rejected' | 'Mess Menu' | 'Emergency' | 'General' | 'Visitor' | 'Attendance';
  read: boolean;
  date: string;
  link?: string;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  target: 'All' | 'Student' | 'Warden' | 'Staff' | 'Admin';
  recipientId?: string;
  deliveryChannel: 'In-App' | 'Email' | 'SMS';
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Failed';
  scheduledTime?: string;
  sentTime?: string;
  read: boolean;
  readAt?: string;
  readBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: NotificationMessage['type'];
  target: NotificationMessage['target'];
  deliveryChannel: NotificationMessage['deliveryChannel'];
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface EmergencyAlert {
  id: string;
  type: 'Fire' | 'Medical' | 'Security' | 'Other';
  location: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'Active' | 'Resolved';
  notifiedTo: string[];
  resolvedAt?: string;
}

export interface Document {
  id: string;
  studentId: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  verified: boolean;
  category: 'ID Proof' | 'Admission Letter' | 'Fee Receipt' | 'Leave Document' | 'Other';
  fileUrl?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  department: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Event' | 'Notice';
  author: string;
}

export interface InstituteSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  academicYear: string;
  currentSemester: string;
}

export interface HostelSettings {
  id: string;
  hostelId: string;
  checkInTime: string;
  checkOutTime: string;
  lateFeePerDay: number;
  messFeePerMonth: number;
  allowOvernight: boolean;
  visitorAllowed: boolean;
  parentApprovalRequired: boolean;
}

export interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemPreferences {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  attendanceCutoffTime: string;
  feeDueReminderDays: number;
  notificationPreferences: {
    feeDueReminders: boolean;
    leaveRequestAlerts: boolean;
    complaintUpdates: boolean;
    messMenuUpdates: boolean;
    emergencyAlerts: boolean;
  };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'Completed' | 'Failed' | 'In Progress';
  createdAt: string;
  performedBy: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: string }[];
}
