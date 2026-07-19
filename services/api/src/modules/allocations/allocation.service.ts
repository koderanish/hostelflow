import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { ApiError } from '../../utils/apiResponse';
import { Prisma } from '@prisma/client';

const include = {
  student: {
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
  },
  room: {
    include: {
      hostel: { select: { id: true, hostelName: true } },
      building: { select: { id: true, name: true, code: true } },
    },
  },
  bed: { select: { id: true, bedNumber: true, status: true } },
  application: { select: { id: true, status: true } },
};

export const list = async (params: any) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const where: Prisma.AllocationWhereInput = {};

  if (params.search) {
    where.student = {
      user: { fullName: { contains: params.search, mode: 'insensitive' } },
    };
  }
  if (params.studentId) where.studentId = params.studentId;
  if (params.roomId) where.roomId = params.roomId;
  if (params.bedId) where.bedId = params.bedId;
  if (params.status) where.status = params.status;

  const [data, total] = await Promise.all([
    prisma.allocation.findMany({ where, skip, take: limit, include, orderBy: { allocatedDate: 'desc' } }),
    prisma.allocation.count({ where }),
  ]);
  return { data, total };
};

export const getById = async (id: string) => {
  const data = await prisma.allocation.findUnique({ where: { id }, include });
  if (!data) throw new ApiError(404, 'Allocation not found');
  return data;
};

export const create = async (input: any) => {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    include: { user: { select: { fullName: true } } },
  });
  if (!student) throw new ApiError(404, 'Student not found');

  const activeAlloc = await prisma.allocation.findFirst({
    where: { studentId: input.studentId, status: 'ACTIVE' },
  });
  if (activeAlloc) throw new ApiError(400, 'Student already has an active allocation');

  const room = await prisma.room.findUnique({
    where: { id: input.roomId },
    include: { hostel: true, building: true },
  });
  if (!room) throw new ApiError(404, 'Room not found');

  if (room.hostel?.gender && student.gender && room.hostel.gender !== student.gender) {
    throw new ApiError(400, `Gender mismatch: hostel is ${room.hostel.gender}, student is ${student.gender}`);
  }

  if (input.bedId) {
    const bed = await prisma.bed.findUnique({ where: { id: input.bedId } });
    if (!bed) throw new ApiError(404, 'Bed not found');
    if (bed.status !== 'AVAILABLE') throw new ApiError(400, `Bed is not available. Current status: ${bed.status}`);
    if (bed.roomId !== input.roomId) throw new ApiError(400, 'Bed does not belong to the specified room');
  }

  if (input.applicationId) {
    const app = await prisma.application.findUnique({ where: { id: input.applicationId } });
    if (!app) throw new ApiError(404, 'Application not found');
    if (app.status !== 'Approved') throw new ApiError(400, 'Application is not approved');
  }

  const [allocation] = await prisma.$transaction([
    prisma.allocation.create({
      data: {
        studentId: input.studentId,
        roomId: input.roomId,
        bedId: input.bedId || null,
        applicationId: input.applicationId || null,
        allocatedDate: input.allocatedDate ? new Date(input.allocatedDate) : new Date(),
        expectedVacateDate: input.expectedVacateDate ? new Date(input.expectedVacateDate) : null,
        checkIn: input.checkIn ? new Date(input.checkIn) : null,
        checkOut: input.checkOut ? new Date(input.checkOut) : null,
        status: 'ACTIVE',
      },
      include,
    }),
    prisma.room.update({
      where: { id: input.roomId },
      data: { occupied: { increment: 1 } },
    }),
    ...(input.bedId
      ? [
          prisma.bed.update({
            where: { id: input.bedId },
            data: { status: 'OCCUPIED', studentId: input.studentId },
          }),
        ]
      : []),
  ]);

  return allocation;
};

export const vacate = async (id: string) => {
  const alloc = await prisma.allocation.findUnique({
    where: { id },
    include: { room: true, bed: true },
  });
  if (!alloc) throw new ApiError(404, 'Allocation not found');
  if (alloc.status !== 'ACTIVE') throw new ApiError(400, `Cannot vacate allocation with status '${alloc.status}'`);

  const [updated] = await prisma.$transaction([
    prisma.allocation.update({
      where: { id },
      data: { status: 'VACATED', checkOut: new Date() },
      include,
    }),
    prisma.room.update({
      where: { id: alloc.roomId },
      data: { occupied: { decrement: 1 } },
    }),
    ...(alloc.bedId
      ? [
          prisma.bed.update({
            where: { id: alloc.bedId },
            data: { status: 'AVAILABLE', studentId: null },
          }),
        ]
      : []),
  ]);

  return updated;
};

export const transfer = async (id: string, input: { roomId: string; bedId?: string }) => {
  const alloc = await prisma.allocation.findUnique({
    where: { id },
    include: { room: true, bed: true },
  });
  if (!alloc) throw new ApiError(404, 'Allocation not found');
  if (alloc.status !== 'ACTIVE') throw new ApiError(400, `Cannot transfer allocation with status '${alloc.status}'`);

  const newRoom = await prisma.room.findUnique({ where: { id: input.roomId } });
  if (!newRoom) throw new ApiError(404, 'Target room not found');

  if (input.bedId) {
    const newBed = await prisma.bed.findUnique({ where: { id: input.bedId } });
    if (!newBed) throw new ApiError(404, 'Target bed not found');
    if (newBed.status !== 'AVAILABLE') throw new ApiError(400, 'Target bed is not available');
    if (newBed.roomId !== input.roomId) throw new ApiError(400, 'Target bed does not belong to the specified room');
  }

  const [newAlloc] = await prisma.$transaction([
    // Vacate old
    prisma.allocation.update({
      where: { id },
      data: { status: 'TRANSFERRED', checkOut: new Date() },
    }),
    // Free old room
    prisma.room.update({
      where: { id: alloc.roomId },
      data: { occupied: { decrement: 1 } },
    }),
    // Free old bed
    ...(alloc.bedId
      ? [
          prisma.bed.update({
            where: { id: alloc.bedId },
            data: { status: 'AVAILABLE', studentId: null },
          }),
        ]
      : []),
    // Create new allocation
    prisma.allocation.create({
      data: {
        studentId: alloc.studentId,
        roomId: input.roomId,
        bedId: input.bedId || null,
        allocatedDate: new Date(),
        status: 'ACTIVE',
      },
      include,
    }),
    // Occupy new room
    prisma.room.update({
      where: { id: input.roomId },
      data: { occupied: { increment: 1 } },
    }),
    // Occupy new bed
    ...(input.bedId
      ? [
          prisma.bed.update({
            where: { id: input.bedId },
            data: { status: 'OCCUPIED', studentId: alloc.studentId },
          }),
        ]
      : []),
  ]);

  return newAlloc;
};

export const update = async (id: string, data: any) => {
  const existing = await prisma.allocation.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Allocation not found');
  return prisma.allocation.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.checkIn && { checkIn: new Date(data.checkIn) }),
      ...(data.checkOut && { checkOut: new Date(data.checkOut) }),
      ...(data.expectedVacateDate && { expectedVacateDate: new Date(data.expectedVacateDate) }),
      ...(data.transferHistory && { transferHistory: data.transferHistory }),
    },
    include,
  });
};

export const remove = async (id: string) => {
  const existing = await prisma.allocation.findUnique({
    where: { id },
    include: { bed: true },
  });
  if (!existing) throw new ApiError(404, 'Allocation not found');
  if (existing.status === 'ACTIVE') {
    await prisma.$transaction([
      prisma.room.update({
        where: { id: existing.roomId },
        data: { occupied: { decrement: 1 } },
      }),
      ...(existing.bedId
        ? [
            prisma.bed.update({
              where: { id: existing.bedId },
              data: { status: 'AVAILABLE', studentId: null },
            }),
          ]
        : []),
    ]);
  }
  await prisma.allocation.delete({ where: { id } });
  return { id };
};
