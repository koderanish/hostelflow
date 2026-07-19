import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { ApiError } from '../../utils/apiResponse';
import { Prisma } from '@prisma/client';

const include = {
  hostel: { select: { id: true, hostelName: true } },
  building: { select: { id: true, name: true, code: true } },
  _count: { select: { allocations: true } },
};

export const list = async (params: any) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const where: Prisma.RoomWhereInput = {};

  if (params.search) {
    where.OR = [
      { roomNumber: { contains: params.search, mode: 'insensitive' } },
      { roomType: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.hostelId) where.hostelId = params.hostelId;
  if (params.buildingId) where.buildingId = params.buildingId;
  if (params.floor) where.floor = parseInt(params.floor, 10);
  if (params.roomType) where.roomType = params.roomType;
  if (params.status) where.status = params.status;

  const [data, total] = await Promise.all([
    prisma.room.findMany({ where, skip, take: limit, include, orderBy: { roomNumber: 'asc' } }),
    prisma.room.count({ where }),
  ]);
  return { data, total };
};

export const getById = async (id: string) => {
  const data = await prisma.room.findUnique({ where: { id }, include: { ...include, allocations: { include: { student: { include: { user: { select: { fullName: true } } } } }, orderBy: { allocatedDate: 'desc' } } } });
  if (!data) throw new ApiError(404, 'Room not found');
  return data;
};

export const create = async (data: any) => {
  return prisma.room.create({ data, include });
};

export const update = async (id: string, data: any) => {
  await getById(id);
  return prisma.room.update({ where: { id }, data, include });
};

export const remove = async (id: string) => {
  await getById(id);
  await prisma.room.delete({ where: { id } });
  return { id };
};
