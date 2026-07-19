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

  const warden = await prisma.user.findFirst({ where: { email: 'warden@hostelflow.com' } });
  const wardenId = warden?.id;

  const boysHostel = await prisma.hostel.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      hostelName: 'Boys Hostel - A',
      hostelType: 'Boys',
      gender: 'Male',
      capacity: 200,
      floors: 4,
      address: 'Main Campus, Block A',
      wardenId,
    },
  });
  console.log(`  Hostel '${boysHostel.hostelName}' ready`);

  const girlsHostel = await prisma.hostel.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      hostelName: 'Girls Hostel - B',
      hostelType: 'Girls',
      gender: 'Female',
      capacity: 150,
      floors: 3,
      address: 'Main Campus, Block B',
      wardenId,
    },
  });
  console.log(`  Hostel '${girlsHostel.hostelName}' ready`);

  const buildings = [
    { id: '00000000-0000-0000-0000-000000000010', hostelId: boysHostel.id, name: 'A-Block', code: 'A', floors: 4, capacity: 80, gender: 'Male' },
    { id: '00000000-0000-0000-0000-000000000011', hostelId: boysHostel.id, name: 'B-Block', code: 'B', floors: 4, capacity: 80, gender: 'Male' },
    { id: '00000000-0000-0000-0000-000000000012', hostelId: boysHostel.id, name: 'C-Block', code: 'C', floors: 2, capacity: 40, gender: 'Male' },
    { id: '00000000-0000-0000-0000-000000000013', hostelId: girlsHostel.id, name: 'D-Block', code: 'D', floors: 3, capacity: 75, gender: 'Female' },
    { id: '00000000-0000-0000-0000-000000000014', hostelId: girlsHostel.id, name: 'E-Block', code: 'E', floors: 3, capacity: 75, gender: 'Female' },
  ];

  const createdBuildings = [];
  for (const b of buildings) {
    const building = await prisma.building.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    });
    createdBuildings.push(building);
    console.log(`  Building '${building.name}' ready`);
  }

  let roomCounter = 0;
  const roomTypes = ['Single', 'Double', 'Triple', 'Dormitory'];
  for (const building of createdBuildings) {
    const floors = building.floors || 3;
    const roomsPerFloor = 8;
    for (let floor = 1; floor <= floors; floor++) {
      for (let r = 1; r <= roomsPerFloor; r++) {
        roomCounter++;
        const roomNum = `${building.code}${floor.toString().padStart(2, '0')}${r.toString().padStart(2, '0')}`;
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const cap = roomType === 'Single' ? 1 : roomType === 'Double' ? 2 : roomType === 'Triple' ? 3 : 4;
        await prisma.room.upsert({
          where: { id: `00000000-0000-0000-0000-${roomCounter.toString().padStart(12, '0')}` },
          update: {},
          create: {
            id: `00000000-0000-0000-0000-${roomCounter.toString().padStart(12, '0')}`,
            hostelId: building.hostelId,
            buildingId: building.id,
            roomNumber: roomNum,
            floor,
            roomType,
            capacity: cap,
            price: cap * 5000,
            status: 'AVAILABLE',
          },
        });
      }
    }
  }
  console.log(`  ${roomCounter} rooms created`);

  // Create beds for each room
  const allRooms = await prisma.room.findMany();
  const bedData: { roomId: string; bedNumber: string }[] = [];
  for (const room of allRooms) {
    const cap = room.capacity || 1;
    for (let b = 1; b <= cap; b++) {
      bedData.push({ roomId: room.id, bedNumber: `B${String.fromCharCode(64 + b)}` });
    }
  }
  await prisma.bed.createMany({ data: bedData, skipDuplicates: true });
  console.log(`  ${bedData.length} beds created`);

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
