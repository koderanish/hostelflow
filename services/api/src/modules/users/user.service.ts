import crypto from 'crypto';
import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

function generatePassword(length = 8): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length }, () => chars[crypto.randomInt(chars.length)]).join('');
}

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatar: true,
  status: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
};

export const list = async (params: any) => {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  const skip = (page - 1) * limit;
  const search = params.search || '';
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';

  const where: any = {};
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (params.roles) {
    const roles = params.roles.split(',').map((r: string) => r.trim().toUpperCase());
    where.role = { name: { in: roles } };
  }

  const orderBy: any = {};
  const sortMap: Record<string, string> = { name: 'fullName', createdAt: 'createdAt', email: 'email' };
  orderBy[sortMap[sortBy] || 'createdAt'] = sortOrder;

  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy, select: userSelect }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
};

export const getById = async (id: string) => {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
};

export const create = async (data: any) => {
  let roleId = data.roleId;
  if (!roleId && data.role) {
    const role = await prisma.role.findFirst({ where: { name: { equals: data.role, mode: 'insensitive' } } });
    if (!role) throw new Error(`Role '${data.role}' not found`);
    roleId = role.id;
  }
  if (!roleId) {
    const defaultRole = await prisma.role.findFirst({ where: { name: 'STAFF' } });
    roleId = defaultRole?.id;
  }

  const plainPassword = data.password || generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName || data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      roleId,
      status: data.status !== undefined ? data.status : true,
    },
    select: userSelect,
  });

  return { ...user, generatedPassword: plainPassword };
};

export const update = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.fullName) updateData.fullName = data.fullName;
  if (data.name) updateData.fullName = data.name;
  if (data.email) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.password) updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);

  if (data.role) {
    const role = await prisma.role.findFirst({ where: { name: { equals: data.role, mode: 'insensitive' } } });
    if (role) updateData.roleId = role.id;
  }

  return prisma.user.update({ where: { id }, data: updateData, select: userSelect });
};

export const resetPassword = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, fullName: true } });
  if (!user) throw new Error('User not found');

  const plainPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return {
    loginId: user.email,
    name: user.fullName,
    generatedPassword: plainPassword,
  };
};

export const remove = async (id: string) => {
  await prisma.user.update({ where: { id }, data: { status: false } });
  return { id };
};
