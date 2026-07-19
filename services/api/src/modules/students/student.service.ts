import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const studentSelect = {
  id: true,
  enrollmentNo: true,
  course: true,
  department: true,
  year: true,
  gender: true,
  dob: true,
  guardianName: true,
  guardianPhone: true,
  address: true,
  bloodGroup: true,
  user: {
    select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true },
  },
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
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { enrollmentNo: { contains: search, mode: 'insensitive' } },
      { course: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (params.gender) where.gender = params.gender;
  if (params.department) where.department = params.department;
  if (params.status) where.user = { ...where.user, status: params.status === 'Active' ? true : params.status === 'Inactive' ? false : undefined };

  const orderBy: any = {};
  const sortMap: Record<string, string> = { name: 'user_fullName', createdAt: 'createdAt', enrollmentNo: 'enrollmentNo' };
  if (sortMap[sortBy] === 'user_fullName') {
    orderBy.user = { fullName: sortOrder };
  } else {
    orderBy[sortMap[sortBy] || 'createdAt'] = sortOrder;
  }

  const [data, total] = await Promise.all([
    prisma.student.findMany({ where, skip, take: limit, orderBy, select: studentSelect }),
    prisma.student.count({ where }),
  ]);

  return { data, total };
};

export const getById = async (id: string) => {
  return prisma.student.findUnique({ where: { id }, select: studentSelect });
};

export const create = async (data: any) => {
  const role = await prisma.role.findFirst({ where: { name: 'STUDENT' } });
  if (!role) throw new Error('STUDENT role not found');

  const hashedPassword = data.password ? await bcrypt.hash(data.password, SALT_ROUNDS) : await bcrypt.hash('student123', SALT_ROUNDS);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: data.fullName || data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        roleId: role.id,
        status: data.status === 'Inactive' ? false : true,
      },
    });

    return tx.student.create({
      data: {
        userId: user.id,
        enrollmentNo: data.enrollmentNo || null,
        course: data.course || null,
        department: data.department || null,
        year: data.year ? parseInt(data.year) : null,
        gender: data.gender || null,
        dob: data.dob ? new Date(data.dob) : null,
        guardianName: data.parentName || data.guardianName || null,
        guardianPhone: data.parentContact || data.guardianPhone || null,
        address: data.address || null,
        bloodGroup: data.bloodGroup || null,
      },
      select: studentSelect,
    });
  });
};

export const update = async (id: string, data: any) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new Error('Student not found');

  return prisma.$transaction(async (tx) => {
    const studentData: any = {};
    if (data.enrollmentNo !== undefined) studentData.enrollmentNo = data.enrollmentNo;
    if (data.course !== undefined) studentData.course = data.course;
    if (data.department !== undefined) studentData.department = data.department;
    if (data.year !== undefined) studentData.year = parseInt(data.year);
    if (data.gender !== undefined) studentData.gender = data.gender;
    if (data.dob !== undefined) studentData.dob = data.dob ? new Date(data.dob) : null;
    if (data.parentName !== undefined) studentData.guardianName = data.parentName;
    if (data.guardianName !== undefined) studentData.guardianName = data.guardianName;
    if (data.parentContact !== undefined) studentData.guardianPhone = data.parentContact;
    if (data.guardianPhone !== undefined) studentData.guardianPhone = data.guardianPhone;
    if (data.address !== undefined) studentData.address = data.address;
    if (data.bloodGroup !== undefined) studentData.bloodGroup = data.bloodGroup;

    if (Object.keys(studentData).length > 0) {
      await tx.student.update({ where: { id }, data: studentData });
    }

    const userData: any = {};
    if (data.fullName) userData.fullName = data.fullName;
    if (data.name) userData.fullName = data.name;
    if (data.email) userData.email = data.email;
    if (data.phone !== undefined) userData.phone = data.phone;
    if (data.status) userData.status = data.status === 'Active' ? true : false;

    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: student.userId }, data: userData });
    }

    return tx.student.findUnique({ where: { id }, select: studentSelect });
  });
};

export const remove = async (id: string) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new Error('Student not found');
  await prisma.user.update({ where: { id: student.userId }, data: { status: false } });
  return { id };
};
