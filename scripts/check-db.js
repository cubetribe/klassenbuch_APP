const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking Railway Database...\n');
    
    // Check Users
    const users = await prisma.user.findMany();
    console.log(`👥 Users: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Check Courses
    const courses = await prisma.course.findMany();
    console.log(`\n📚 Courses: ${courses.length}`);
    courses.forEach(course => {
      console.log(`  - ${course.name} (${course.subject}) - ${course.schoolYear}`);
    });
    
    // Check Students
    const students = await prisma.student.findMany();
    console.log(`\n👨‍🎓 Students: ${students.length}`);
    students.forEach(student => {
      console.log(`  - ${student.displayName} (${student.internalCode}) - XP: ${student.currentXP}`);
    });
    
    // Check Rewards
    const rewards = await prisma.reward.findMany();
    console.log(`\n🎁 Rewards: ${rewards.length}`);
    rewards.forEach(reward => {
      console.log(`  - ${reward.name} (${reward.costXP} XP) - ${reward.category}`);
    });
    
    // Check Consequences
    const consequences = await prisma.consequence.findMany();
    console.log(`\n⚠️ Consequences: ${consequences.length}`);
    consequences.forEach(consequence => {
      console.log(`  - ${consequence.name} (${consequence.severity})`);
    });
    
    // Check Events
    const events = await prisma.behaviorEvent.findMany();
    console.log(`\n📊 Behavior Events: ${events.length}`);
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();