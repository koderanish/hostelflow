import crypto from 'crypto';
import prisma from '../../config/database';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

function generatePassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length }, () => chars[crypto.randomInt(chars.length)]).join('');
}

const studentSelect = {
  id: true,
  registrationNo: true,
  enrollmentNo: true,
  course: true,
  department: true,
  year: true,
  semester: true,
  gender: true,
  dob: true,
  guardianName: true,
  guardianPhone: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  emergencyContactRelation: true,
  address: true,
  bloodGroup: true,
  status: true,
  feeStatus: true,
  admissionDate: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, fullName: true, email: true, phone: true, status: true, createdAt: true },
  },
};

function extractYear(y: string | number | undefined | null): number | null {
  if (!y) return null;
  if (typeof y === 'number') return y;
  const m = String(y).match(/\d+/);
  return m ? parseInt(m[0]) : null;
}

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
      { registrationNo: { contains: search, mode: 'insensitive' } },
      { course: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (params.gender) where.gender = params.gender;
  if (params.department) where.department = params.department;
  if (params.status && params.status !== 'all') where.status = params.status;

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

  const plainPassword = data.password || generatePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const student = await prisma.$transaction(async (tx) => {
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
        registrationNo: data.registrationNo || null,
        enrollmentNo: data.enrollmentNo || null,
        course: data.course || null,
        department: data.department || null,
        year: extractYear(data.year),
        semester: data.semester || null,
        gender: data.gender || null,
        dob: data.dob ? new Date(data.dob) : null,
        guardianName: data.parentName || data.guardianName || null,
        guardianPhone: data.parentContact || data.guardianPhone || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        emergencyContactRelation: data.emergencyContactRelation || null,
        address: data.address || null,
        bloodGroup: data.bloodGroup || null,
        status: data.status || 'Active',
        feeStatus: data.feeStatus || 'PENDING',
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : null,
      },
      select: studentSelect,
    });
  });

  return { ...student, generatedPassword: plainPassword };
};

export const update = async (id: string, data: any) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new Error('Student not found');

  return prisma.$transaction(async (tx) => {
    const studentData: any = {};
    if (data.registrationNo !== undefined) studentData.registrationNo = data.registrationNo;
    if (data.enrollmentNo !== undefined) studentData.enrollmentNo = data.enrollmentNo;
    if (data.course !== undefined) studentData.course = data.course;
    if (data.department !== undefined) studentData.department = data.department;
    if (data.year !== undefined) studentData.year = extractYear(data.year);
    if (data.semester !== undefined) studentData.semester = data.semester;
    if (data.gender !== undefined) studentData.gender = data.gender;
    if (data.dob !== undefined) studentData.dob = data.dob ? new Date(data.dob) : null;
    if (data.parentName !== undefined) studentData.guardianName = data.parentName;
    if (data.guardianName !== undefined) studentData.guardianName = data.guardianName;
    if (data.parentContact !== undefined) studentData.guardianPhone = data.parentContact;
    if (data.guardianPhone !== undefined) studentData.guardianPhone = data.guardianPhone;
    if (data.emergencyContactName !== undefined) studentData.emergencyContactName = data.emergencyContactName;
    if (data.emergencyContactPhone !== undefined) studentData.emergencyContactPhone = data.emergencyContactPhone;
    if (data.emergencyContactRelation !== undefined) studentData.emergencyContactRelation = data.emergencyContactRelation;
    if (data.address !== undefined) studentData.address = data.address;
    if (data.bloodGroup !== undefined) studentData.bloodGroup = data.bloodGroup;
    if (data.status !== undefined) studentData.status = data.status;
    if (data.feeStatus !== undefined) studentData.feeStatus = data.feeStatus;
    if (data.admissionDate !== undefined) studentData.admissionDate = data.admissionDate ? new Date(data.admissionDate) : null;

    if (Object.keys(studentData).length > 0) {
      await tx.student.update({ where: { id }, data: studentData });
    }

    const userData: any = {};
    if (data.fullName) userData.fullName = data.fullName;
    if (data.name) userData.fullName = data.name;
    if (data.email) userData.email = data.email;
    if (data.phone !== undefined) userData.phone = data.phone;
    if (data.status === 'Active') userData.status = true;
    else if (data.status === 'Inactive') userData.status = false;

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
