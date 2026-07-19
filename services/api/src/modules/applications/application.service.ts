import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
};

const STATUS_REVERSE: Record<string, string> = {
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
  Waitlisted: 'WAITLISTED',
  Cancelled: 'CANCELLED',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'WAITLISTED', 'CANCELLED'],
  WAITLISTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
};

const applicationInclude = {
  student: {
    select: {
      id: true,
      course: true,
      department: true,
      year: true,
      semester: true,
      user: { select: { id: true, fullName: true, email: true, phone: true } },
    },
  },
  hostel: { select: { id: true, hostelName: true } },
} satisfies Prisma.ApplicationInclude;

function mapApp(a: any) {
  return {
    id: a.id,
    studentId: a.studentId,
    studentName: a.student?.user?.fullName || '',
    course: a.student?.course || '',
    year: a.student?.year ? `${a.student.year} Year` : '',
    preferredHostelId: a.hostelId,
    preferredHostel: a.hostel?.hostelName || '',
    preferredRoomType: a.preferredRoomType || '',
    academicYear: '',
    semester: a.student?.semester || '',
    reason: a.reason || '',
    specialRequirements: '',
    medicalRequirements: '',
    status: STATUS_MAP[a.status as string] || a.status,
    appliedDate: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : '',
    reviewedBy: a.reviewedBy || undefined,
    reviewedDate: a.reviewedDate ? new Date(a.reviewedDate).toISOString().split('T')[0] : undefined,
    reviewRemarks: a.reviewRemarks || undefined,
    isDeleted: a.isDeleted || false,
    createdAt: a.createdAt?.toISOString() || '',
    updatedAt: a.updatedAt?.toISOString() || '',
  };
}

const sortMap: Record<string, string> = {
  appliedDate: 'createdAt',
  studentName: 'createdAt',
  status: 'status',
  preferredHostel: 'hostelId',
};

export const list = async (params: any) => {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  const skip = (page - 1) * limit;
  const search = params.search || '';
  const status = params.status;
  const hostelId = params.hostelId;
  const studentId = params.studentId;
  const sortBy = sortMap[params.sortBy as string] || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

  const where: Prisma.ApplicationWhereInput = { isDeleted: false };
  if (studentId) {
    where.studentId = studentId;
  }
  if (status && status !== 'all') {
    where.status = STATUS_REVERSE[status as string] || status;
  }
  if (hostelId && hostelId !== 'all') {
    where.hostelId = hostelId;
  }
  if (search) {
    where.OR = [
      { student: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
      { hostel: { hostelName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: applicationInclude,
    }),
    prisma.application.count({ where }),
  ]);

  return { data: data.map(mapApp), total };
};

export const getById = async (id: string) => {
  const app = await prisma.application.findUnique({
    where: { id },
    include: applicationInclude,
  });
  if (!app || app.isDeleted) return null;
  return mapApp(app);
};

export const create = async (data: any) => {
  const student = await prisma.student.findUnique({ where: { id: data.studentId } });
  if (!student) throw new Error('Student not found');

  const existing = await prisma.application.findFirst({
    where: {
      studentId: data.studentId,
      status: { in: ['PENDING', 'WAITLISTED'] },
      isDeleted: false,
    },
  });
  if (existing) throw new Error('Student already has an active application');

  const activeAlloc = await prisma.allocation.findFirst({
    where: { studentId: data.studentId, status: 'ACTIVE' },
  });
  if (activeAlloc) throw new Error('Student already has an active room allocation');

  const app = await prisma.application.create({
    data: {
      studentId: data.studentId,
      hostelId: data.hostelId || data.preferredHostelId,
      preferredRoomType: data.preferredRoomType || null,
      reason: data.reason || null,
    },
    include: applicationInclude,
  });

  return mapApp(app);
};

export const update = async (id: string, data: any) => {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) throw new Error('Application not found');

  const app = await prisma.application.update({
    where: { id },
    data: {
      hostelId: data.hostelId ?? data.preferredHostelId ?? existing.hostelId,
      preferredRoomType: data.preferredRoomType ?? existing.preferredRoomType,
      reason: data.reason ?? existing.reason,
    },
    include: applicationInclude,
  });

  return mapApp(app);
};

export const remove = async (id: string) => {
  await prisma.application.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const restore = async (id: string) => {
  const app = await prisma.application.update({
    where: { id },
    data: { isDeleted: false },
    include: applicationInclude,
  });
  return mapApp(app);
};

export const approve = async (id: string, reviewedBy: string, reviewRemarks?: string) => {
  return transitionStatus(id, 'APPROVED', reviewedBy, reviewRemarks);
};

export const reject = async (id: string, reviewedBy: string, reviewRemarks?: string) => {
  return transitionStatus(id, 'REJECTED', reviewedBy, reviewRemarks);
};

export const waitlist = async (id: string, reviewedBy: string, reviewRemarks?: string) => {
  return transitionStatus(id, 'WAITLISTED', reviewedBy, reviewRemarks);
};

export const cancel = async (id: string) => {
  return transitionStatus(id, 'CANCELLED');
};

async function transitionStatus(id: string, newStatus: string, performedBy?: string, reviewRemarks?: string) {
  const app = await prisma.application.findUnique({ where: { id } });
  if (!app || app.isDeleted) throw new Error('Application not found');

  const allowed = STATUS_TRANSITIONS[app.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from '${STATUS_MAP[app.status] || app.status}' to '${STATUS_MAP[newStatus] || newStatus}'`);
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: newStatus,
      reviewedBy: performedBy || app.reviewedBy,
      reviewedDate: reviewRemarks !== undefined ? new Date() : app.reviewedDate,
      reviewRemarks: reviewRemarks !== undefined ? reviewRemarks : app.reviewRemarks,
    },
    include: applicationInclude,
  });

  return mapApp(updated);
}

export const getHistory = async (id: string) => {
  return [];
};
