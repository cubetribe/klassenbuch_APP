// Restore rewards and consequences data after schema migration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rewards = [
  {
    name: "Extra Pause",
    description: "5 Minuten zusätzliche Pause",
    costXP: 20,
    category: "Freizeit",
    emoji: "🏃‍♂️",
    active: true
  },
  {
    name: "Lieblingssitzplatz",
    description: "Eine Woche am Lieblingssitzplatz sitzen",
    costXP: 15,
    category: "Komfort",
    emoji: "💺",
    active: true
  },
  {
    name: "Hausaufgaben-Joker",
    description: "Eine Hausaufgabe auslassen",
    costXP: 30,
    category: "Lernen",
    emoji: "🃏",
    active: true
  },
  {
    name: "Klassenbibliothek",
    description: "Zugang zur Klassenbibliothek",
    costXP: 10,
    category: "Lernen", 
    emoji: "📚",
    active: true
  },
  {
    name: "Musik hören",
    description: "Mit Kopfhörern Musik während der Stillarbeit",
    costXP: 25,
    category: "Freizeit",
    emoji: "🎵",
    active: true
  },
  {
    name: "Tafel wischen",
    description: "Darf die Tafel für den Lehrer wischen",
    costXP: 5,
    category: "Helfer",
    emoji: "🧽",
    active: true
  },
  {
    name: "Erste Pause",
    description: "Als erster in die Pause gehen",
    costXP: 10,
    category: "Freizeit",
    emoji: "🚪",
    active: true
  },
  {
    name: "Computer Zeit",
    description: "10 Minuten freie Computer-Zeit",
    costXP: 35,
    category: "Technik",
    emoji: "💻",
    active: true
  }
];

const consequences = [
  {
    name: "Kurze Auszeit",
    description: "2 Minuten ruhig am Platz sitzen",
    severity: "MINOR",
    notesRequired: false,
    emoji: "⏱️",
    active: true
  },
  {
    name: "Entschuldigung schreiben",
    description: "Eine schriftliche Entschuldigung verfassen",
    severity: "MINOR", 
    notesRequired: true,
    emoji: "✍️",
    active: true
  },
  {
    name: "Pausenaufsicht helfen",
    description: "Pausenaufsicht bei der Arbeit unterstützen",
    severity: "MINOR",
    notesRequired: false,
    emoji: "👥",
    active: true
  },
  {
    name: "Referat vorbereiten",
    description: "Ein kurzes Referat über respektvolles Verhalten",
    severity: "MODERATE",
    notesRequired: true,
    emoji: "📝",
    active: true
  },
  {
    name: "Klassendienst übernehmen",
    description: "Eine Woche zusätzlichen Klassendienst",
    severity: "MODERATE",
    notesRequired: false,
    emoji: "🧹",
    active: true
  },
  {
    name: "Gespräch mit Eltern",
    description: "Elterngespräch über das Verhalten",
    severity: "MAJOR",
    notesRequired: true,
    emoji: "👨‍👩‍👧‍👦",
    active: true
  },
  {
    name: "Nachsitzen",
    description: "30 Minuten nach der Schule bleiben",
    severity: "MAJOR",
    notesRequired: true,
    emoji: "⏰",
    active: true
  },
  {
    name: "Schulleitung",
    description: "Gespräch mit der Schulleitung",
    severity: "MAJOR",
    notesRequired: true,
    emoji: "🏫",
    active: true
  }
];

async function restoreData() {
  try {
    console.log('🔄 Restoring rewards and consequences...\n');
    
    // Create rewards
    console.log('🏆 Creating rewards...');
    for (const reward of rewards) {
      await prisma.reward.create({ data: reward });
      console.log(`  ✅ Created: ${reward.name}`);
    }
    
    // Create consequences  
    console.log('\n⚠️ Creating consequences...');
    for (const consequence of consequences) {
      await prisma.consequence.create({ data: consequence });
      console.log(`  ✅ Created: ${consequence.name}`);
    }
    
    console.log('\n✅ Successfully restored all data!');
    
    // Verify
    const rewardCount = await prisma.reward.count();
    const consequenceCount = await prisma.consequence.count();
    
    console.log(`\n📊 Final counts:`);
    console.log(`  - Rewards: ${rewardCount}`);
    console.log(`  - Consequences: ${consequenceCount}`);
    
  } catch (error) {
    console.error('❌ Error restoring data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();