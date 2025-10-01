import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  const passwordHash = await bcrypt.hash('Mi83xer#', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'dennis@goaiex.com' },
    update: {
      emailVerified: new Date(), // Ensure admin is verified
      passwordHash, // Update password in case it changed
    },
    create: {
      email: 'dennis@goaiex.com',
      name: 'Dennis Westermann',
      passwordHash,
      role: 'ADMIN',
      emailVerified: new Date(), // Admin is pre-verified
    },
  });

  console.log('✅ Admin user created/updated:', admin.email);
  console.log('   - Name:', admin.name);
  console.log('   - Role:', admin.role);
  console.log('   - Email Verified:', admin.emailVerified ? 'Yes' : 'No');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
