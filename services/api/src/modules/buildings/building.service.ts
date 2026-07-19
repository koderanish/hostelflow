import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { ApiError } from '../../utils/apiResponse';
import { Prisma } from '@prisma/client';

const include = {
  hostel: { select: { id: true, hostelName: true } },
  warden: { select: { id: true, fullName: true, email: true } },
  _count: { select: { rooms: true } },
};

export const list = async (params: any) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const where: Prisma.BuildingWhereInput = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { code: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.hostelId) where.hostelId = params.hostelId;
  if (params.gender) where.gender = params.gender;
  if (params.status) where.status = params.status;

  const [data, total] = await Promise.all([
    prisma.building.findMany({ where, skip, take: limit, include, orderBy: { name: 'asc' } }),
    prisma.building.count({ where }),
  ]);
  return { data, total };
};

export const getById = async (id: string) => {
  const data = await prisma.building.findUnique({ where: { id }, include: { ...include, rooms: { include: { _count: { select: { allocations: true } } }, orderBy: { roomNumber: 'asc' } } } });
  if (!data) throw new ApiError(404, 'Building not found');
  return data;
};

export const create = async (data: any) => {
  return prisma.building.create({ data, include });
};

export const update = async (id: string, data: any) => {
  await getById(id);
  return prisma.building.update({ where: { id }, data, include });
};

export const remove = async (id: string) => {
  await getById(id);
  await prisma.building.delete({ where: { id } });
  return { id };
};
