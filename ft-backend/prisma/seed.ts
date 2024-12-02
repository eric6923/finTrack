import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('your_admin_password', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@fintrack.com' },
    update: {}, // No-op if the record already exists
    create: {
      name: 'Admin',
      email: 'admin@fintrack.com',
      password: hashedPassword,
    },
  });

  console.log('Admin seeded:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
