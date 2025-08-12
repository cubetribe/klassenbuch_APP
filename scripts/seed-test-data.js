const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data to Railway Database...\n');
    
    // Get existing course to add data to
    const course = await prisma.course.findFirst();
    if (!course) {
      console.log('❌ No courses found. Create a course first!');
      return;
    }
    
    console.log(`📚 Using course: ${course.name}`);
    
    // Add sample students
    const studentsToAdd = [
      { displayName: 'Anna', emoji: '👩‍🎓' },
      { displayName: 'Ben', emoji: '👨‍🎓' },
      { displayName: 'Clara', emoji: '👧' },
      { displayName: 'David', emoji: '👦' },
      { displayName: 'Emma', emoji: '👩‍🎓' }
    ];
    
    console.log(`\n👨‍🎓 Adding ${studentsToAdd.length} students...`);
    
    for (const studentData of studentsToAdd) {
      // Generate unique internal code
      const year = new Date().getFullYear();
      const coursePrefix = course.id.substring(0, 2).toUpperCase();
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const internalCode = `${year}-${coursePrefix}-${randomSuffix}`;
      
      const student = await prisma.student.create({
        data: {
          courseId: course.id,
          displayName: studentData.displayName,
          internalCode,
          avatarEmoji: studentData.emoji,
          currentXP: Math.floor(Math.random() * 100) + 20, // Random XP between 20-120
          currentLevel: 1,
          currentColor: 'GREEN',
          active: true
        }
      });
      
      console.log(`  ✅ ${student.displayName} (${student.internalCode}) - ${student.currentXP} XP`);
    }
    
    // Add sample rewards
    const rewardsToAdd = [
      { name: '5 min Extra Pause', category: 'Privilegien', costXP: 20, emoji: '⏰' },
      { name: 'Hausaufgaben-Joker', category: 'Privilegien', costXP: 50, emoji: '🃏' },
      { name: 'Lieblingssitzplatz', category: 'Privilegien', costXP: 30, emoji: '🪑' },
      { name: 'Sticker-Set', category: 'Materialien', costXP: 15, emoji: '⭐' },
      { name: 'Computerspiel-Zeit', category: 'Aktivitäten', costXP: 40, emoji: '🎮' }
    ];
    
    console.log(`\n🎁 Adding ${rewardsToAdd.length} rewards...`);
    
    for (const rewardData of rewardsToAdd) {
      const reward = await prisma.reward.create({
        data: {
          courseId: course.id,
          name: rewardData.name,
          category: rewardData.category,
          costXP: rewardData.costXP,
          emoji: rewardData.emoji,
          active: true
        }
      });
      
      console.log(`  ✅ ${reward.name} (${reward.costXP} XP) - ${reward.category}`);
    }
    
    // Add sample consequences
    const consequencesToAdd = [
      { name: 'Kurze Ermahnung', severity: 'minor', emoji: '⚠️' },
      { name: 'Zusatzaufgabe', severity: 'moderate', emoji: '📝' },
      { name: 'Nachsitzen 15 min', severity: 'moderate', emoji: '⏱️' },
      { name: 'Elterngespräch', severity: 'major', emoji: '👨‍👩‍👧‍👦' },
      { name: 'Schulleiter-Gespräch', severity: 'major', emoji: '🏫' }
    ];
    
    console.log(`\n⚠️ Adding ${consequencesToAdd.length} consequences...`);
    
    for (const consequenceData of consequencesToAdd) {
      const consequence = await prisma.consequence.create({
        data: {
          courseId: course.id,
          name: consequenceData.name,
          severity: consequenceData.severity.toUpperCase(),
          emoji: consequenceData.emoji,
          notesRequired: consequenceData.severity === 'major',
          active: true
        }
      });
      
      console.log(`  ✅ ${consequence.name} (${consequence.severity})`);
    }
    
    console.log('\n🎉 Test data seeding complete!');
    console.log('\n📊 Database now contains:');
    
    // Final count
    const finalCounts = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.student.count(),
      prisma.reward.count(),
      prisma.consequence.count(),
      prisma.behaviorEvent.count()
    ]);
    
    console.log(`  👥 Users: ${finalCounts[0]}`);
    console.log(`  📚 Courses: ${finalCounts[1]}`);
    console.log(`  👨‍🎓 Students: ${finalCounts[2]}`);
    console.log(`  🎁 Rewards: ${finalCounts[3]}`);
    console.log(`  ⚠️ Consequences: ${finalCounts[4]}`);
    console.log(`  📊 Events: ${finalCounts[5]}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();