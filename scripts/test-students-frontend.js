// Test script to check what's happening with students on frontend
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStudentsData() {
  try {
    console.log('🔍 Testing students data structure...\n');
    
    const courseId = '53f69f65-e735-4f15-8c18-e8eae62d3158';
    console.log(`📚 Testing for courseId: ${courseId}\n`);
    
    // 1. Check if we have students in database
    const allStudents = await prisma.student.findMany({
      where: { courseId },
      select: {
        id: true,
        displayName: true,
        avatarEmoji: true,
        currentColor: true,
        currentXP: true,
        currentLevel: true,
        active: true,
        course: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { displayName: 'asc' }
    });
    
    console.log(`✅ Found ${allStudents.length} students in database`);
    
    if (allStudents.length > 0) {
      console.log('\n👨‍🎓 Sample students:');
      allStudents.slice(0, 5).forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.displayName} (${student.avatarEmoji || 'no emoji'}) - ${student.currentColor} - ${student.currentXP} XP`);
      });
      
      console.log('\n📊 Student data structure:');
      console.log(JSON.stringify(allStudents[0], null, 2));
    } else {
      console.log('❌ No students found in database!');
    }
    
    // 2. Test API response format
    console.log('\n🔍 Testing expected API response format:');
    const apiResponse = {
      students: allStudents
    };
    
    console.log('📦 API Response structure:');
    console.log(`- students: array with ${apiResponse.students.length} items`);
    console.log(`- First student has displayName: ${apiResponse.students[0]?.displayName || 'NO DISPLAY NAME'}`);
    console.log(`- First student has avatarEmoji: ${apiResponse.students[0]?.avatarEmoji || 'NO EMOJI'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentsData();