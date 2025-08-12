import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.behaviorEvent.deleteMany();
  await prisma.consequenceApplication.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.consequence.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // Create test user (teacher)
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      passwordHash: hashedPassword,
      name: 'Demo Lehrer',
      role: 'TEACHER',
    },
  });
  console.log('✅ Created teacher:', teacher.email);

  // Create a course
  const course = await prisma.course.create({
    data: {
      name: 'Klasse 5a',
      subject: 'Mathematik',
      schoolYear: '2024/2025',
      teacherId: teacher.id,
      settings: {
        colors: {
          blue: { min: 80, max: 100 },
          green: { min: 50, max: 79 },
          yellow: { min: 25, max: 49 },
          red: { min: 0, max: 24 },
        },
        quickActions: {
          positive: [
            { id: '1', label: 'Gute Mitarbeit', icon: '👍', xpChange: 5, hotkey: '1' },
            { id: '2', label: 'Hausaufgaben', icon: '📚', xpChange: 3, hotkey: '2' },
            { id: '3', label: 'Hilfsbereit', icon: '🤝', xpChange: 4, hotkey: '3' },
          ],
          negative: [
            { id: '4', label: 'Störung', icon: '🔇', xpChange: -5, hotkey: '4' },
            { id: '5', label: 'Keine HA', icon: '❌', xpChange: -3, hotkey: '5' },
            { id: '6', label: 'Verspätung', icon: '⏰', xpChange: -2, hotkey: '6' },
          ],
        },
      },
    },
  });
  console.log('✅ Created course:', course.name);

  // Create students
  const studentNames = [
    { displayName: 'Anna', emoji: '👧' },
    { displayName: 'Ben', emoji: '👦' },
    { displayName: 'Clara', emoji: '👩' },
    { displayName: 'David', emoji: '👨' },
    { displayName: 'Emma', emoji: '👧' },
    { displayName: 'Felix', emoji: '👦' },
    { displayName: 'Greta', emoji: '👩' },
    { displayName: 'Hans', emoji: '👨' },
    { displayName: 'Ida', emoji: '👧' },
    { displayName: 'Jonas', emoji: '👦' },
    { displayName: 'Klara', emoji: '👩' },
    { displayName: 'Leo', emoji: '👨' },
    { displayName: 'Mia', emoji: '👧' },
    { displayName: 'Noah', emoji: '👦' },
    { displayName: 'Olivia', emoji: '👩' },
  ];

  const students = await Promise.all(
    studentNames.map(async (student, index) => {
      const code = `S${(index + 1).toString().padStart(3, '0')}`;
      return prisma.student.create({
        data: {
          displayName: student.displayName,
          internalCode: code,
          avatarEmoji: student.emoji,
          courseId: course.id,
          currentXP: Math.floor(Math.random() * 80) + 20,
          currentLevel: Math.floor(Math.random() * 3) + 1,
          currentColor: ['GREEN', 'YELLOW', 'BLUE', 'RED'][Math.floor(Math.random() * 4)] as any,
        },
      });
    })
  );
  console.log(`✅ Created ${students.length} students`);

  // Create some rewards
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        name: 'Hausaufgabenfrei',
        description: 'Einmal Hausaufgaben erlassen',
        emoji: '🎉',
        costXP: 50,
        costLevel: 2,
        category: 'PRIVILEGE',
        weeklyLimit: 1,
        courseId: course.id,
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Sitzplatzwahl',
        description: 'Freie Sitzplatzwahl für eine Woche',
        emoji: '💺',
        costXP: 30,
        costLevel: 1,
        category: 'PRIVILEGE',
        weeklyLimit: 1,
        courseId: course.id,
      },
    }),
    prisma.reward.create({
      data: {
        name: 'Bonuspunkte',
        description: '+5 Punkte für die nächste Klassenarbeit',
        emoji: '⭐',
        costXP: 100,
        costLevel: 3,
        category: 'ACADEMIC',
        weeklyLimit: 1,
        courseId: course.id,
      },
    }),
  ]);
  console.log(`✅ Created ${rewards.length} rewards`);

  // Create some consequences
  const consequences = await Promise.all([
    prisma.consequence.create({
      data: {
        name: 'Nachsitzen',
        description: '15 Minuten nachsitzen',
        emoji: '⏱️',
        severity: 'MODERATE',
        notesRequired: true,
        courseId: course.id,
      },
    }),
    prisma.consequence.create({
      data: {
        name: 'Elterninfo',
        description: 'Information an die Eltern',
        emoji: '📧',
        severity: 'MAJOR',
        notesRequired: true,
        courseId: course.id,
      },
    }),
    prisma.consequence.create({
      data: {
        name: 'Zusatzaufgabe',
        description: 'Extra Hausaufgaben',
        emoji: '📝',
        severity: 'MINOR',
        notesRequired: false,
        courseId: course.id,
      },
    }),
  ]);
  console.log(`✅ Created ${consequences.length} consequences`);

  // Create some behavior events
  const events = await Promise.all(
    students.slice(0, 5).map(async (student) => {
      return prisma.behaviorEvent.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          type: 'MANUAL_ACTION',
          payload: {
            action: 'Gute Mitarbeit',
            xpChange: 5,
            icon: '👍',
          },
          notes: 'Sehr aktive Beteiligung im Unterricht',
          createdBy: teacher.id,
        },
      });
    })
  );
  console.log(`✅ Created ${events.length} behavior events`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });