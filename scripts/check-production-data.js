// Check production database for user and student data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductionData() {
  try {
    console.log('🔍 Checking production database...\n');
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log(`👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Check courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        subject: true,
        teacherId: true
      }
    });
    
    console.log(`\n📚 Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`  - ${course.name} (${course.subject})`);
    });
    
    // Check students for the specific course
    const courseId = '53f69f65-e735-4f15-8c18-e8eae62d3158';
    const students = await prisma.student.findMany({
      where: { courseId },
      select: {
        id: true,
        displayName: true,
        avatarEmoji: true,
        currentColor: true,
        active: true
      }
    });
    
    console.log(`\n👨‍🎓 Found ${students.length} students in course ${courseId}:`);
    students.slice(0, 5).forEach(student => {
      console.log(`  - ${student.displayName} ${student.avatarEmoji || '(no emoji)'} (${student.currentColor})`);
    });
    
    // Check rewards (should be school-wide now)
    const rewards = await prisma.reward.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        active: true
      }
    });
    
    console.log(`\n🏆 Found ${rewards.length} rewards (school-wide):`);
    rewards.slice(0, 3).forEach(reward => {
      console.log(`  - ${reward.name} (${reward.category})`);
    });
    
    // Check consequences (should be school-wide now)
    const consequences = await prisma.consequence.findMany({
      select: {
        id: true,
        name: true,
        severity: true,
        active: true
      }
    });
    
    console.log(`\n⚠️ Found ${consequences.length} consequences (school-wide):`);
    consequences.slice(0, 3).forEach(consequence => {
      console.log(`  - ${consequence.name} (${consequence.severity})`);
    });
    
    console.log('\n✅ Production database is healthy!');
    
  } catch (error) {
    console.error('❌ Production database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionData();