const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAndSeedRealistic() {
  try {
    console.log('🧹 Cleaning existing data...\n');
    
    // Delete all data except the main user
    await prisma.behaviorEvent.deleteMany();
    await prisma.rewardRedemption.deleteMany();
    await prisma.consequenceApplication.deleteMany();
    await prisma.student.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.consequence.deleteMany();
    await prisma.course.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.report.deleteMany();
    
    console.log('✅ Cleaned existing data');
    
    // Get the main user
    const teacher = await prisma.user.findFirst();
    if (!teacher) {
      console.log('❌ No teacher found!');
      return;
    }
    
    console.log('🎓 Creating realistic school data for presentation...\n');
    
    // Create realistic courses
    const coursesToCreate = [
      { name: 'Klasse 7a', subject: 'Mathematik', schoolYear: '2024/2025' },
      { name: 'Klasse 7a', subject: 'Deutsch', schoolYear: '2024/2025' },
      { name: 'Klasse 8b', subject: 'Englisch', schoolYear: '2024/2025' },
      { name: 'Klasse 9c', subject: 'Physik', schoolYear: '2024/2025' },
      { name: 'Klasse 6a', subject: 'Geschichte', schoolYear: '2024/2025' }
    ];
    
    console.log('📚 Creating courses...');
    const courses = [];
    
    for (const courseData of coursesToCreate) {
      const course = await prisma.course.create({
        data: {
          ...courseData,
          teacherId: teacher.id,
          archived: false,
          settings: {
            levelSystem: {
              startXP: 50,
              levelThreshold: 100,
              maxLevel: 10,
              enableLevels: true
            },
            colors: [
              { color: 'BLUE', minXP: 80, label: 'Ausgezeichnet' },
              { color: 'GREEN', minXP: 60, maxXP: 79, label: 'Gut' },
              { color: 'YELLOW', minXP: 40, maxXP: 59, label: 'Befriedigend' },
              { color: 'RED', maxXP: 39, label: 'Verbesserung nötig' }
            ]
          }
        }
      });
      courses.push(course);
      console.log(`  ✅ ${course.name} - ${course.subject}`);
    }
    
    // Create realistic students for each course
    const germanFirstNames = [
      'Alexander', 'Anna', 'Ben', 'Clara', 'David', 'Emma', 'Felix', 'Hannah', 
      'Jonas', 'Julia', 'Leon', 'Lena', 'Max', 'Marie', 'Noah', 'Sofia', 
      'Paul', 'Lea', 'Tim', 'Mia', 'Jan', 'Laura', 'Tom', 'Lisa',
      'Marco', 'Sarah', 'Lukas', 'Nina', 'Kevin', 'Jessica'
    ];
    
    const emojis = ['👨‍🎓', '👩‍🎓', '👦', '👧', '🧑‍🎓', '👨‍💼', '👩‍💼', '🧒'];
    
    console.log('\n👨‍🎓 Creating students...');
    
    for (const course of courses) {
      const studentsPerClass = Math.floor(Math.random() * 8) + 18; // 18-25 students per class
      const usedNames = new Set();
      
      console.log(`\n  📚 ${course.name} - ${course.subject}:`);
      
      for (let i = 0; i < studentsPerClass; i++) {
        let firstName;
        do {
          firstName = germanFirstNames[Math.floor(Math.random() * germanFirstNames.length)];
        } while (usedNames.has(firstName));
        usedNames.add(firstName);
        
        // Generate unique internal code
        const year = new Date().getFullYear();
        const coursePrefix = course.id.substring(0, 2).toUpperCase();
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const internalCode = `${year}-${coursePrefix}-${randomSuffix}`;
        
        // Realistic XP distribution (bell curve around 60)
        const baseXP = 60;
        const variation = 30;
        const randomXP = Math.max(10, Math.min(100, 
          baseXP + (Math.random() - 0.5) * variation * 2
        ));
        
        // Calculate color based on XP
        let currentColor = 'GREEN';
        if (randomXP >= 80) currentColor = 'BLUE';
        else if (randomXP >= 60) currentColor = 'GREEN';
        else if (randomXP >= 40) currentColor = 'YELLOW';
        else currentColor = 'RED';
        
        const student = await prisma.student.create({
          data: {
            courseId: course.id,
            displayName: firstName,
            internalCode,
            avatarEmoji: emojis[Math.floor(Math.random() * emojis.length)],
            currentXP: Math.round(randomXP),
            currentLevel: Math.floor(randomXP / 50) + 1,
            currentColor,
            active: true
          }
        });
        
        console.log(`    • ${student.displayName} (${student.currentXP} XP - ${student.currentColor})`);
      }
    }
    
    // Create realistic rewards for each course
    console.log('\n🎁 Creating rewards...');
    
    const rewardTemplates = [
      // Privilegien
      { name: '5 Minuten Extra Pause', category: 'Privilegien', costXP: 20, emoji: '⏰' },
      { name: 'Hausaufgaben-Joker', category: 'Privilegien', costXP: 50, emoji: '🃏' },
      { name: 'Lieblingssitzplatz wählen', category: 'Privilegien', costXP: 30, emoji: '🪑' },
      { name: 'Klassendienst-Pause', category: 'Privilegien', costXP: 25, emoji: '🆓' },
      { name: 'Computer-Zeit (10 Min)', category: 'Privilegien', costXP: 35, emoji: '💻' },
      
      // Materialien
      { name: 'Sticker-Pack', category: 'Materialien', costXP: 15, emoji: '⭐' },
      { name: 'Buntstift-Set', category: 'Materialien', costXP: 40, emoji: '🖍️' },
      { name: 'Notizblock Premium', category: 'Materialien', costXP: 30, emoji: '📓' },
      { name: 'Radiergummi Special', category: 'Materialien', costXP: 20, emoji: '🔸' },
      
      // Aktivitäten
      { name: 'Unterrichtsspiel vorschlagen', category: 'Aktivitäten', costXP: 45, emoji: '🎲' },
      { name: 'Tafel wischen (freiwillig)', category: 'Aktivitäten', costXP: 25, emoji: '🧽' },
      { name: 'Klassenhelfer für einen Tag', category: 'Aktivitäten', costXP: 40, emoji: '🤝' },
      { name: 'Pausenmusik auswählen', category: 'Aktivitäten', costXP: 30, emoji: '🎵' },
      
      // Soziales
      { name: 'Lobende Erwähnung im Klassenbuch', category: 'Soziales', costXP: 60, emoji: '📝' },
      { name: 'Positive Rückmeldung an Eltern', category: 'Soziales', costXP: 80, emoji: '👨‍👩‍👧‍👦' }
    ];
    
    for (const course of courses) {
      console.log(`\n  🎯 ${course.name} - ${course.subject}:`);
      
      // Select 8-12 random rewards per course
      const numRewards = Math.floor(Math.random() * 5) + 8;
      const selectedRewards = [...rewardTemplates]
        .sort(() => 0.5 - Math.random())
        .slice(0, numRewards);
      
      for (const rewardData of selectedRewards) {
        const reward = await prisma.reward.create({
          data: {
            courseId: course.id,
            name: rewardData.name,
            category: rewardData.category,
            costXP: rewardData.costXP,
            emoji: rewardData.emoji,
            description: `Belohnung für gute Leistungen im Fach ${course.subject}`,
            weeklyLimit: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : null,
            active: true
          }
        });
        
        console.log(`    • ${reward.name} (${reward.costXP} XP)`);
      }
    }
    
    // Create realistic consequences
    console.log('\n⚠️ Creating consequences...');
    
    const consequenceTemplates = [
      // Minor
      { name: 'Kurze Ermahnung', severity: 'minor', emoji: '⚠️', notes: false },
      { name: 'Klassengespräch', severity: 'minor', emoji: '💬', notes: false },
      { name: 'Zusätzliche Übungsaufgabe', severity: 'minor', emoji: '📝', notes: false },
      { name: 'Entschuldigung schreiben', severity: 'minor', emoji: '✍️', notes: false },
      
      // Moderate
      { name: 'Nachsitzen (15 Minuten)', severity: 'moderate', emoji: '⏱️', notes: true },
      { name: 'Zusätzlicher Klassendienst', severity: 'moderate', emoji: '🧹', notes: true },
      { name: 'Pausenverbot (eine Pause)', severity: 'moderate', emoji: '🚫', notes: true },
      { name: 'Reflexionsbogen ausfüllen', severity: 'moderate', emoji: '🤔', notes: true },
      
      // Major
      { name: 'Elterngespräch', severity: 'major', emoji: '👨‍👩‍👧‍👦', notes: true },
      { name: 'Schulleitung informieren', severity: 'major', emoji: '🏫', notes: true },
      { name: 'Klassenbucheintrag', severity: 'major', emoji: '📚', notes: true },
      { name: 'Sozialdienst (Schule)', severity: 'major', emoji: '🤝', notes: true }
    ];
    
    for (const course of courses) {
      console.log(`\n  🎯 ${course.name} - ${course.subject}:`);
      
      // All courses get all consequences (standardized)
      for (const consequenceData of consequenceTemplates) {
        const consequence = await prisma.consequence.create({
          data: {
            courseId: course.id,
            name: consequenceData.name,
            severity: consequenceData.severity.toUpperCase(),
            emoji: consequenceData.emoji,
            description: `Pädagogische Maßnahme bei Unterrichtsstörungen`,
            notesRequired: consequenceData.notes,
            active: true
          }
        });
        
        console.log(`    • ${consequence.name} (${consequence.severity})`);
      }
    }
    
    // Final summary
    console.log('\n🎉 Realistic school data created successfully!\n');
    
    const finalCounts = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.student.count(),
      prisma.reward.count(),
      prisma.consequence.count()
    ]);
    
    console.log('📊 Final Database Contents:');
    console.log(`  👥 Users: ${finalCounts[0]}`);
    console.log(`  📚 Courses: ${finalCounts[1]} (verschiedene Klassen und Fächer)`);
    console.log(`  👨‍🎓 Students: ${finalCounts[2]} (realistische deutsche Namen)`);
    console.log(`  🎁 Rewards: ${finalCounts[3]} (pädagogisch sinnvolle Belohnungen)`);
    console.log(`  ⚠️ Consequences: ${finalCounts[4]} (abgestufte Konsequenzen)`);
    
    console.log('\n✨ Ready for presentation! 🚀');
    
  } catch (error) {
    console.error('❌ Error creating realistic data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeedRealistic();