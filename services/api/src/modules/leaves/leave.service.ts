import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

const STATUS_REVERSE: Record<string, string> = {
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
  Cancelled: 'CANCELLED',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

const leaveInclude = {
  student: {
    select: {
      id: true,
      enrollmentNo: true,
      course: true,
      department: true,
      year: true,
      user: { select: { id: true, fullName: true, email: true, phone: true } },
    },
  },
  approvedByUser: { select: { id: true, fullName: true } },
} satisfies Prisma.LeaveInclude;

function mapLeave(l: any) {
  return {
    id: l.id,
    studentId: l.studentId,
    studentName: l.student?.user?.fullName || '',
    leaveType: l.leaveType || 'Personal',
    fromDate: l.fromDate ? new Date(l.fromDate).toISOString().split('T')[0] : '',
    toDate: l.toDate ? new Date(l.toDate).toISOString().split('T')[0] : '',
    reason: l.reason || '',
    status: STATUS_MAP[l.status as string] || l.status,
    approvedBy: l.approvedBy || undefined,
    remarks: l.remarks || undefined,
    isDeleted: l.isDeleted || false,
    createdAt: l.createdAt?.toISOString() || '',
    updatedAt: l.updatedAt?.toISOString() || '',
  };
}

const sortMap: Record<string, string> = {
  createdAt: 'createdAt',
  fromDate: 'fromDate',
  status: 'status',
};

export const list = async (params: any) => {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  const skip = (page - 1) * limit;
  const search = params.search || '';
  const sortBy = sortMap[params.sortBy as string] || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

  const where: Prisma.LeaveWhereInput = { isDeleted: false };
  if (search) {
    where.OR = [
      { reason: { contains: search, mode: 'insensitive' } },
      { student: { user: { fullName: { contains: search, mode: 'insensitive' } } } },
    ];
  }
  if (params.status) {
    where.status = STATUS_REVERSE[params.status as string] || params.status;
  }
  if (params.leaveType) {
    where.leaveType = params.leaveType;
  }
  if (params.studentId) {
    where.studentId = params.studentId;
  }

  const [data, total] = await Promise.all([
    prisma.leave.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder }, include: leaveInclude }),
    prisma.leave.count({ where }),
  ]);

  return { data: data.map(mapLeave), total };
};

export const getById = async (id: string) => {
  const l = await prisma.leave.findUnique({ where: { id }, include: leaveInclude });
  if (!l || l.isDeleted) return null;
  return mapLeave(l);
};

export const create = async (data: any) => {
  const l = await prisma.leave.create({
    data: {
      studentId: data.studentId,
      leaveType: data.leaveType || 'Personal',
      fromDate: data.fromDate ? new Date(data.fromDate) : null,
      toDate: data.toDate ? new Date(data.toDate) : null,
      reason: data.reason || '',
      status: 'PENDING',
      remarks: data.remarks || null,
    },
    include: leaveInclude,
  });
  return mapLeave(l);
};

export const update = async (id: string, data: any) => {
  const existing = await prisma.leave.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) throw new Error('Leave not found');

  const l = await prisma.leave.update({
    where: { id },
    data: {
      leaveType: data.leaveType ?? existing.leaveType,
      fromDate: data.fromDate ? new Date(data.fromDate) : existing.fromDate,
      toDate: data.toDate ? new Date(data.toDate) : existing.toDate,
      reason: data.reason ?? existing.reason,
      remarks: data.remarks ?? existing.remarks,
    },
    include: leaveInclude,
  });
  return mapLeave(l);
};

export const remove = async (id: string) => {
  await prisma.leave.update({ where: { id }, data: { isDeleted: true } });
};

export const restore = async (id: string) => {
  const l = await prisma.leave.update({ where: { id }, data: { isDeleted: false }, include: leaveInclude });
  return mapLeave(l);
};

async function transitionStatus(id: string, newStatus: string, approvedBy?: string, remarks?: string) {
  const l = await prisma.leave.findUnique({ where: { id } });
  if (!l || l.isDeleted) throw new Error('Leave not found');

  const allowed = STATUS_TRANSITIONS[l.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from '${STATUS_MAP[l.status] || l.status}' to '${STATUS_MAP[newStatus] || newStatus}'`);
  }

  const updated = await prisma.leave.update({
    where: { id },
    data: {
      status: newStatus,
      approvedBy: approvedBy || l.approvedBy,
      remarks: remarks !== undefined ? remarks : l.remarks,
    },
    include: leaveInclude,
  });
  return mapLeave(updated);
}

export const approve = async (id: string, approvedBy: string, remarks?: string) =>
  transitionStatus(id, 'APPROVED', approvedBy, remarks);

export const reject = async (id: string, approvedBy: string, remarks: string) => {
  if (!remarks) throw new Error('Remarks are required for rejection');
  return transitionStatus(id, 'REJECTED', approvedBy, remarks);
};

export const cancel = async (id: string) => {
  const l = await prisma.leave.findUnique({ where: { id } });
  if (!l || l.isDeleted) throw new Error('Leave not found');

  const allowed = STATUS_TRANSITIONS[l.status] || [];
  if (!allowed.includes('CANCELLED')) {
    throw new Error(`Cannot cancel. Current status: '${STATUS_MAP[l.status] || l.status}'`);
  }

  const updated = await prisma.leave.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: leaveInclude,
  });
  return mapLeave(updated);
};

export const getHistory = async (id: string) => [];
