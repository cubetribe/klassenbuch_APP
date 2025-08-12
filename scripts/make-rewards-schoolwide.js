const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeRewardsSchoolwide() {
  try {
    console.log('🔄 Making rewards and consequences school-wide...\n');
    
    // Get the teacher
    const teacher = await prisma.user.findFirst();
    if (!teacher) {
      console.log('❌ No teacher found!');
      return;
    }
    
    console.log(`👨‍🏫 Teacher: ${teacher.name}`);
    
    // Delete all existing rewards and consequences (we'll recreate them as school-wide)
    console.log('\n🧹 Cleaning existing course-specific rewards and consequences...');
    
    await prisma.rewardRedemption.deleteMany();
    await prisma.consequenceApplication.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.consequence.deleteMany();
    
    console.log('✅ Cleaned existing data');
    
    // Create school-wide rewards (not tied to specific courses)
    console.log('\n🎁 Creating school-wide rewards...');
    
    const schoolWideRewards = [
      // Kleine Belohnungen (15-25 XP)
      { name: 'Sticker-Pack', category: 'Materialien', costXP: 15, emoji: '⭐' },
      { name: '5 Minuten Extra Pause', category: 'Privilegien', costXP: 20, emoji: '⏰' },
      { name: 'Radiergummi Special', category: 'Materialien', costXP: 20, emoji: '🔸' },
      { name: 'Klassendienst-Pause', category: 'Privilegien', costXP: 25, emoji: '🆓' },
      { name: 'Tafel wischen (freiwillig)', category: 'Aktivitäten', costXP: 25, emoji: '🧽' },
      
      // Mittlere Belohnungen (30-45 XP)
      { name: 'Lieblingssitzplatz wählen', category: 'Privilegien', costXP: 30, emoji: '🪑' },
      { name: 'Notizblock Premium', category: 'Materialien', costXP: 30, emoji: '📓' },
      { name: 'Pausenmusik auswählen', category: 'Aktivitäten', costXP: 30, emoji: '🎵' },
      { name: 'Computer-Zeit (10 Min)', category: 'Privilegien', costXP: 35, emoji: '💻' },
      { name: 'Klassenhelfer für einen Tag', category: 'Aktivitäten', costXP: 40, emoji: '🤝' },
      { name: 'Buntstift-Set', category: 'Materialien', costXP: 40, emoji: '🖍️' },
      { name: 'Unterrichtsspiel vorschlagen', category: 'Aktivitäten', costXP: 45, emoji: '🎲' },
      
      // Große Belohnungen (50+ XP)
      { name: 'Hausaufgaben-Joker', category: 'Privilegien', costXP: 50, emoji: '🃏' },
      { name: 'Lobende Erwähnung im Klassenbuch', category: 'Soziales', costXP: 60, emoji: '📝' },
      { name: 'Pausenhof-Spiel organisieren', category: 'Aktivitäten', costXP: 65, emoji: '⚽' },
      { name: 'Positive Rückmeldung an Eltern', category: 'Soziales', costXP: 80, emoji: '👨‍👩‍👧‍👦' },
      { name: 'Schüler des Monats Kandidatur', category: 'Soziales', costXP: 100, emoji: '🏆' }
    ];
    
    for (const rewardData of schoolWideRewards) {
      const reward = await prisma.reward.create({
        data: {
          teacherId: teacher.id, // Reward belongs to teacher, not course
          name: rewardData.name,
          category: rewardData.category,
          costXP: rewardData.costXP,
          emoji: rewardData.emoji,
          description: `Allgemeine Belohnung für alle Klassen`,
          weeklyLimit: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : null,
          active: true
        }
      });
      
      console.log(`  ✅ ${reward.name} (${reward.costXP} XP)`);
    }
    
    // Create school-wide consequences
    console.log('\n⚠️ Creating school-wide consequences...');
    
    const schoolWideConsequences = [
      // Minor - Leichte Maßnahmen
      { name: 'Kurze Ermahnung', severity: 'minor', emoji: '⚠️', notes: false },
      { name: 'Klassengespräch', severity: 'minor', emoji: '💬', notes: false },
      { name: 'Entschuldigung bei Mitschüler', severity: 'minor', emoji: '🤝', notes: false },
      { name: 'Zusätzliche Übungsaufgabe', severity: 'minor', emoji: '📝', notes: false },
      { name: 'Kurze Reflexion schreiben', severity: 'minor', emoji: '✍️', notes: false },
      
      // Moderate - Mittlere Maßnahmen
      { name: 'Nachsitzen (15 Minuten)', severity: 'moderate', emoji: '⏱️', notes: true },
      { name: 'Zusätzlicher Klassendienst', severity: 'moderate', emoji: '🧹', notes: true },
      { name: 'Pausenverbot (eine Pause)', severity: 'moderate', emoji: '🚫', notes: true },
      { name: 'Reflexionsbogen ausfüllen', severity: 'moderate', emoji: '🤔', notes: true },
      { name: 'Entschuldigungsbrief schreiben', severity: 'moderate', emoji: '📄', notes: true },
      { name: 'Arbeitsauftrag in der Pause', severity: 'moderate', emoji: '📚', notes: true },
      
      // Major - Schwere Maßnahmen
      { name: 'Elterngespräch', severity: 'major', emoji: '👨‍👩‍👧‍👦', notes: true },
      { name: 'Schulleitung informieren', severity: 'major', emoji: '🏫', notes: true },
      { name: 'Klassenbucheintrag', severity: 'major', emoji: '📚', notes: true },
      { name: 'Sozialdienst (Schule)', severity: 'major', emoji: '🤝', notes: true },
      { name: 'Nachsitzen (60 Minuten)', severity: 'major', emoji: '🕐', notes: true },
      { name: 'Ausschluss vom Ausflug', severity: 'major', emoji: '🚌', notes: true }
    ];
    
    for (const consequenceData of schoolWideConsequences) {
      const consequence = await prisma.consequence.create({
        data: {
          teacherId: teacher.id, // Consequence belongs to teacher, not course
          name: consequenceData.name,
          severity: consequenceData.severity.toUpperCase(),
          emoji: consequenceData.emoji,
          description: `Allgemeine pädagogische Maßnahme für alle Klassen`,
          notesRequired: consequenceData.notes,
          active: true
        }
      });
      
      console.log(`  ✅ ${consequence.name} (${consequence.severity})`);
    }
    
    // Summary
    console.log('\n🎉 School-wide rewards and consequences created!\n');
    
    const finalCounts = await Promise.all([
      prisma.reward.count(),
      prisma.consequence.count()
    ]);
    
    console.log('📊 Final counts:');
    console.log(`  🎁 School-wide Rewards: ${finalCounts[0]}`);
    console.log(`  ⚠️ School-wide Consequences: ${finalCounts[1]}`);
    
    console.log('\n✨ Now all rewards and consequences are available across all classes! 🚀');
    
  } catch (error) {
    console.error('❌ Error making rewards school-wide:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeRewardsSchoolwide();