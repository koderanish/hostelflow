import prisma from '../../config/database';
import { getPagination } from '../../utils/pagination';
import { ApiError } from '../../utils/apiResponse';
import { Prisma } from '@prisma/client';

const include = {
  warden: { select: { id: true, fullName: true, email: true } },
  _count: { select: { buildings: true, rooms: true } },
};

export const list = async (params: any) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const where: Prisma.HostelWhereInput = {};

  if (params.search) {
    where.OR = [
      { hostelName: { contains: params.search, mode: 'insensitive' } },
      { hostelType: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  if (params.gender) where.gender = params.gender;

  const [data, total] = await Promise.all([
    prisma.hostel.findMany({ where, skip, take: limit, include, orderBy: { hostelName: 'asc' } }),
    prisma.hostel.count({ where }),
  ]);
  return { data, total };
};

export const getById = async (id: string) => {
  const data = await prisma.hostel.findUnique({ where: { id }, include: { ...include, buildings: { include: { _count: { select: { rooms: true } } } } } });
  if (!data) throw new ApiError(404, 'Hostel not found');
  return data;
};

export const create = async (data: any) => {
  return prisma.hostel.create({ data, include });
};

export const update = async (id: string, data: any) => {
  await getById(id);
  return prisma.hostel.update({ where: { id }, data, include });
};

export const remove = async (id: string) => {
  await getById(id);
  await prisma.hostel.delete({ where: { id } });
  return { id };
};
