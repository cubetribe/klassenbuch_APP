const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting demo data seed...');

  try {
    // Create demo teacher user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@school.com' },
      update: {
        passwordHash: hashedPassword,
        name: 'Demo Lehrer',
      },
      create: {
        id: '1', // Match the demo-users.ts ID
        email: 'teacher@school.com',
        name: 'Demo Lehrer',
        passwordHash: hashedPassword,
        role: 'TEACHER',
      },
    });

    console.log('✅ Created/updated demo teacher:', teacher.email);
    console.log('🎉 Demo user ready! Login with: teacher@school.com / demo123');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });