import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

const STATUS_MAP: Record<string, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

const STATUS_REVERSE: Record<string, string> = {
  Open: 'OPEN',
  Assigned: 'ASSIGNED',
  'In Progress': 'IN_PROGRESS',
  Resolved: 'RESOLVED',
  Closed: 'CLOSED',
  Rejected: 'REJECTED',
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
};

const complaintInclude = {
  student: {
    select: {
      id: true,
      user: { select: { id: true, fullName: true, email: true, phone: true } },
    },
  },
  assignedToUser: { select: { id: true, fullName: true } },
} satisfies Prisma.ComplaintInclude;

function mapCmp(c: any) {
  return {
    id: c.id,
    studentId: c.studentId,
    studentName: c.student?.user?.fullName || '',
    title: c.title || '',
    description: c.description || '',
    category: c.category || 'Other',
    roomId: c.roomId || '',
    roomNo: c.roomNo || '',
    priority: c.priority || 'Medium',
    status: STATUS_MAP[c.status as string] || c.status,
    assignedTo: c.assignedTo || undefined,
    assignedToName: c.assignedToName || c.assignedToUser?.fullName || '',
    dateAdded: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '',
    resolvedDate: c.resolvedDate ? new Date(c.resolvedDate).toISOString().split('T')[0] : undefined,
    resolutionNotes: c.resolutionNotes || undefined,
    isDeleted: c.isDeleted || false,
    createdAt: c.createdAt?.toISOString() || '',
    updatedAt: c.updatedAt?.toISOString() || '',
  };
}

export const list = async (params: any) => {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  const skip = (page - 1) * limit;
  const search = params.search || '';
  const status = params.status;
  const category = params.category;
  const sortBy = params.sortBy === 'dateAdded' ? 'createdAt' : params.sortBy === 'priority' ? 'priority' : 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

  const where: Prisma.ComplaintWhereInput = { isDeleted: false };
  if (status && status !== 'all') {
    where.status = STATUS_REVERSE[status as string] || status;
  }
  if (category && category !== 'all') {
    where.category = category;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { student: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: complaintInclude,
    }),
    prisma.complaint.count({ where }),
  ]);

  return { data: data.map(mapCmp), total };
};

export const getById = async (id: string) => {
  const c = await prisma.complaint.findUnique({
    where: { id },
    include: complaintInclude,
  });
  if (!c || c.isDeleted) return null;
  return mapCmp(c);
};

export const create = async (data: any) => {
  const student = await prisma.student.findUnique({ where: { id: data.studentId } });
  if (!student) throw new Error('Student not found');

  const complaint = await prisma.complaint.create({
    data: {
      studentId: data.studentId,
      roomId: data.roomId || null,
      roomNo: data.roomNo || null,
      category: data.category || null,
      title: data.title || null,
      description: data.description || null,
      priority: data.priority || 'Medium',
    },
    include: complaintInclude,
  });

  return mapCmp(complaint);
};

export const update = async (id: string, data: any) => {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) throw new Error('Complaint not found');

  const complaint = await prisma.complaint.update({
    where: { id },
    data: {
      category: data.category ?? existing.category,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      priority: data.priority ?? existing.priority,
      roomId: data.roomId ?? existing.roomId,
      roomNo: data.roomNo ?? existing.roomNo,
    },
    include: complaintInclude,
  });

  return mapCmp(complaint);
};

export const remove = async (id: string) => {
  await prisma.complaint.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const restore = async (id: string) => {
  await prisma.complaint.update({
    where: { id },
    data: { isDeleted: false },
  });
};

export const assignStaff = async (id: string, staffId: string, staffName: string) => {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) throw new Error('Complaint not found');

  const complaint = await prisma.complaint.update({
    where: { id },
    data: { assignedTo: staffId, assignedToName: staffName },
    include: complaintInclude,
  });

  return mapCmp(complaint);
};

async function transitionStatus(id: string, newStatus: string) {
  const c = await prisma.complaint.findUnique({ where: { id } });
  if (!c || c.isDeleted) throw new Error('Complaint not found');

  const allowed = VALID_TRANSITIONS[c.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from '${STATUS_MAP[c.status] || c.status}' to '${STATUS_MAP[newStatus] || newStatus}'`);
  }

  const updateData: any = { status: newStatus };
  if (newStatus === 'RESOLVED') {
    updateData.resolvedDate = new Date();
  }

  const complaint = await prisma.complaint.update({
    where: { id },
    data: updateData,
    include: complaintInclude,
  });

  return mapCmp(complaint);
}

export const markInProgress = async (id: string) => transitionStatus(id, 'IN_PROGRESS');
export const resolveComplaint = async (id: string, resolutionNotes: string) => {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) throw new Error('Complaint not found');

  const allowed = VALID_TRANSITIONS[existing.status] || [];
  if (!allowed.includes('RESOLVED')) {
    throw new Error(`Cannot resolve. Current status: '${STATUS_MAP[existing.status] || existing.status}'`);
  }

  const complaint = await prisma.complaint.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolvedDate: new Date(),
      resolutionNotes: resolutionNotes || null,
    },
    include: complaintInclude,
  });

  return mapCmp(complaint);
};
export const closeComplaint = async (id: string) => transitionStatus(id, 'CLOSED');
export const rejectComplaint = async (id: string, remarks: string) => {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) throw new Error('Complaint not found');

  const allowed = VALID_TRANSITIONS[existing.status] || [];
  if (!allowed.includes('REJECTED')) {
    throw new Error(`Cannot reject. Current status: '${STATUS_MAP[existing.status] || existing.status}'`);
  }

  const complaint = await prisma.complaint.update({
    where: { id },
    data: {
      status: 'REJECTED',
      resolutionNotes: remarks || null,
    },
    include: complaintInclude,
  });

  return mapCmp(complaint);
};

export const getHistory = async (id: string) => {
  return [];
};
