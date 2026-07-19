import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { ApiError } from '../../utils/apiResponse';
import { Prisma } from '@prisma/client';

const include = {
  room: {
    select: { id: true, roomNumber: true, floor: true, roomType: true, buildingId: true, hostelId: true },
  },
};

export const list = async (params: any) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const where: Prisma.BedWhereInput = {};

  if (params.search) {
    where.OR = [
      { bedNumber: { contains: params.search, mode: 'insensitive' } },
      { room: { roomNumber: { contains: params.search, mode: 'insensitive' } } },
    ];
  }
  if (params.roomId) where.roomId = params.roomId;
  if (params.status) where.status = params.status;
  if (params.studentId) where.studentId = params.studentId;

  const [data, total] = await Promise.all([
    prisma.bed.findMany({ where, skip, take: limit, include, orderBy: { bedNumber: 'asc' } }),
    prisma.bed.count({ where }),
  ]);
  return { data, total };
};

export const getById = async (id: string) => {
  const data = await prisma.bed.findUnique({ where: { id }, include });
  if (!data) throw new ApiError(404, 'Bed not found');
  return data;
};

export const create = async (input: any) => {
  const room = await prisma.room.findUnique({ where: { id: input.roomId } });
  if (!room) throw new ApiError(404, 'Room not found');

  return prisma.bed.create({
    data: {
      roomId: input.roomId,
      bedNumber: input.bedNumber,
      status: input.status || 'AVAILABLE',
    },
    include,
  });
};

export const update = async (id: string, input: any) => {
  const existing = await prisma.bed.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Bed not found');

  return prisma.bed.update({
    where: { id },
    data: {
      ...(input.bedNumber && { bedNumber: input.bedNumber }),
      ...(input.status && { status: input.status }),
    },
    include,
  });
};

export const remove = async (id: string) => {
  const existing = await prisma.bed.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Bed not found');
  if (existing.status === 'OCCUPIED') {
    throw new ApiError(400, 'Cannot delete an occupied bed. Vacate it first.');
  }
  await prisma.bed.delete({ where: { id } });
  return { id };
};
