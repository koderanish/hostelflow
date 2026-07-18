export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface Student {
  id: string;
  name: string;
  room: string;
  avatar: string;
  attendanceStatus?: AttendanceStatus;
}

export type ComplaintPriority = 'critical' | 'medium' | 'low';
export type ComplaintStatus = 'open' | 'in-progress' | 'resolved';

export interface Complaint {
  id: string;
  title: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  room: string;
  category: string;
  timeAgo: string;
  reportedBy: string;
  studentId: string;
  studentPhone?: string;
  description: string;
  imageUrl?: string;
}

export interface Visitor {
  id: string;
  name: string;
  studentName: string;
  entryTime: string;
  status: 'in-premise' | 'checked-out';
  checkOutTime?: string;
}

export interface AttendanceRecord {
  date: string;
  present: number;
  absent: number;
  leave: number;
}
