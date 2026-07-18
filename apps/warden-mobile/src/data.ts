import { Student, Complaint, Visitor, AttendanceRecord } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'HF-2024-001',
    name: 'Sophia Chen',
    room: 'Room 302',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB03tk4BD3-HyPunovqJ3rCHmLe3h8Qll-ypYhh4n3E8dTp0nXMLi4e5qrjAK5nOddzsAD4U3A8vfFY4SJzPsJzbrsSGBR22N1MiE506zTJbTl02vUBR5r28AJt5jCkBYpTmjOh6FxnJ8SEggdoBzNe-8FX9HFmeMX-dVM-nPXMdzEWAXiMTlxHTZBxJ12p3DHwQPY3KTzrhMs7bumS5pvHdGqf3znspLjkT9Wdg2gfR-C1RKLb-NNu',
    attendanceStatus: 'present'
  },
  {
    id: 'HF-2024-002',
    name: 'Marcus Thorne',
    room: 'Room 114',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASJjz8ZpKC5v9Hdg1eFPZSTPJq3av8fOV-06iapH-tCkSwCLTIXy_SuvG1wVfLm2tAWhjzm9kUEYbOQ8xoLSF_xr_d1I5XJZubzZxZS71Rn7SWmWjE6m622fFY9zfFDrQw_uzrPd99e86hwMHWAQm7qTS2MIPzoqKGBWuZpDDh0GuX3E7V5D0Cc-IlEscR8WXTxlU9DRBf3IDze6JidVxYfurvkAuALjJhMbhC-bcbPGw-LrZsxtHn',
    attendanceStatus: undefined
  },
  {
    id: 'HF-2024-003',
    name: 'Elena Rodriguez',
    room: 'Room 205',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzxAYWz1YzfQY49PC-gm2KHP4eY_ExSzIHBN3bTfmFkpwIRaT9spHRSMGVPcFdrxPRtQGByZ0BFElfKI6whIG-uha_0t6aOkVlN1DPKVudw2dU_7dmBE6k2-xVtjBG7P30vzklM_eufXO8xmTNj1jD5dZyBSur5LK9uhAJU7YKYAEuvrQI1p6aMxVNkg8qWNpjRtoQ806y2nTMcueSVe6Au4MimChBznAraOEJ6t2ol0xjh4XoAxCv',
    attendanceStatus: 'leave'
  },
  {
    id: 'HF-2024-004',
    name: 'Aditya Verma',
    room: 'Room 105',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    attendanceStatus: undefined
  },
  {
    id: 'HF-2024-005',
    name: 'Rohan Verma',
    room: 'Room 402-A',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    attendanceStatus: 'present'
  },
  {
    id: 'HF-2024-006',
    name: 'Zara Patel',
    room: 'Room 312',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    attendanceStatus: 'present'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'C-1042',
    title: 'Main Block Water Leakage',
    priority: 'critical',
    status: 'open',
    room: 'Room 402-A',
    category: 'Plumbing',
    timeAgo: '15 mins ago',
    reportedBy: 'Rohan Verma',
    studentId: 'HF-2024-005',
    studentPhone: '+91 98765 43210',
    description: 'Large water leak from the ceiling in the bathroom area. Water is dripping onto the floorboards and might cause electrical hazards. Immediate attention required.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFlv3sLw-MWOdGz43Z-kZFJDGtCSqDbK9lR3rAzlOKTg9UZbFlwd-fU32IHl-IiWj_jniPH8KXvfxDBGMStcc45t2igIKV5gAM2d-mN7ENHjL_AdzNGz2wr0Pe4GbZvbmsYVaLx9kbIgU_tadEHPyYMihk98IvfrqEnEvo9WByBSU6beqRTuZVGBVNcm1DIRFShHrMlhtwi5ahhDPZfvYkwNEV2KaaXtzi78EpnNccKQFY5TvUt9ry'
  },
  {
    id: 'C-1039',
    title: 'AC Unit Noisy / Not Cooling',
    priority: 'medium',
    status: 'in-progress',
    room: 'Room 215',
    category: 'Electrical',
    timeAgo: '2 hours ago',
    reportedBy: 'Devansh Roy',
    studentId: 'HF-2024-012',
    studentPhone: '+91 87654 32109',
    description: 'The AC unit makes a heavy rattling sound when switched on and fails to cool the room. It sounds like something is loose inside.',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'C-1041',
    title: 'Window Latch Broken',
    priority: 'low',
    status: 'open',
    room: 'Room 108',
    category: 'Furniture',
    timeAgo: '1 hour ago',
    reportedBy: 'Arjun Mehta',
    studentId: 'HF-2024-009',
    studentPhone: '+91 76543 21098',
    description: 'The locking latch on the left window is cracked and does not secure properly. Due to heavy winds, the window bangs continuously.',
    imageUrl: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'C-1035',
    title: 'WiFi Connectivity Issues',
    priority: 'medium',
    status: 'in-progress',
    room: 'Common Room B',
    category: 'Network',
    timeAgo: '4 hours ago',
    reportedBy: 'Priya Sharma',
    studentId: 'HF-2024-015',
    studentPhone: '+91 65432 10987',
    description: 'WiFi network drops connection frequently or exhibits extremely high packet loss. Students are unable to access course portals.',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600'
  }
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'V-501',
    name: 'Mark Stevenson',
    studentName: 'Alex Chen',
    entryTime: '10:45 AM',
    status: 'in-premise'
  },
  {
    id: 'V-502',
    name: 'Elena Rodriguez',
    studentName: 'Sofia R.',
    entryTime: '11:15 AM',
    status: 'in-premise'
  },
  {
    id: 'V-503',
    name: 'James Wilson',
    studentName: 'Daniel W.',
    entryTime: '11:30 AM',
    status: 'in-premise'
  },
  {
    id: 'V-504',
    name: 'Sarah Parker',
    studentName: 'Leo P.',
    entryTime: '11:55 AM',
    status: 'in-premise'
  }
];

export const INITIAL_ATTENDANCE_HISTORY: AttendanceRecord[] = [
  { date: '14 Jul 2026', present: 1240, absent: 5, leave: 3 },
  { date: '13 Jul 2026', present: 1238, absent: 7, leave: 3 },
  { date: '12 Jul 2026', present: 1242, absent: 4, leave: 2 },
  { date: '11 Jul 2026', present: 1235, absent: 9, leave: 4 },
  { date: '10 Jul 2026', present: 1245, absent: 1, leave: 2 }
];
