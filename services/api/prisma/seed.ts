import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'WARDEN', 'STUDENT', 'GUARDIAN', 'STAFF'];

const DEMO_USERS = [
  { fullName: 'Admin User', email: 'admin@hostelflow.com', password: 'admin123', role: 'ADMIN' },
  { fullName: 'Warden User', email: 'warden@hostelflow.com', password: 'warden123', role: 'WARDEN' },
  { fullName: 'Ravi Kumar', email: 'ravi@hostelflow.com', password: 'staff123', role: 'STAFF' },
  { fullName: 'Suresh Patel', email: 'suresh@hostelflow.com', password: 'staff123', role: 'STAFF' },
  { fullName: 'Amit Singh', email: 'amit@hostelflow.com', password: 'staff123', role: 'STAFF' },
  { fullName: 'Priya Sharma', email: 'priya@hostelflow.com', password: 'staff123', role: 'STAFF' },
  { fullName: 'Vikram Reddy', email: 'vikram@hostelflow.com', password: 'staff123', role: 'STAFF' },
  { fullName: 'Student User', email: 'student@hostelflow.com', password: 'student123', role: 'STUDENT' },
];


async function main() {
  const password = await bcrypt.hash('password123', 12);

  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    console.log(`  Role '${roleName}' ready`);
  }

  for (const user of DEMO_USERS) {
    const role = await prisma.role.findUnique({ where: { name: user.role } });
    if (!role) continue;

    const hashedPassword = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hashedPassword },
      create: {
        fullName: user.fullName,
        email: user.email,
        password: hashedPassword,
        roleId: role.id,
        status: true,
      },
    });
    console.log(`  User '${user.email}' ready`);
  }

  console.log('\nSeed complete!');
  console.log('Demo accounts:');
  console.log('  admin@hostelflow.com / admin123  (Admin)');
  console.log('  warden@hostelflow.com / warden123  (Warden)');
  console.log('  staff@hostelflow.com / staff123  (Staff)');
  console.log('  student@hostelflow.com / student123  (Student)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
