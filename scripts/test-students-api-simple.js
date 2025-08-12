const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStudentsApiSimple() {
  try {
    console.log('🔍 Testing students API logic directly...\n');
    
    const courseId = '53f69f65-e735-4f15-8c18-e8eae62d3158';
    const userId = '1'; // User ID from our test user
    
    console.log(`📚 Testing for courseId: ${courseId}`);
    console.log(`👤 Testing for userId: ${userId}`);
    
    // Simulate what the API should do
    
    // 1. Check if course exists and user has access
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true, name: true },
    });

    if (!course) {
      console.log('❌ Course not found');
      return;
    }

    console.log(`✅ Found course: ${course.name}`);
    console.log(`👨‍🏫 Course teacher: ${course.teacherId}`);
    console.log(`🔑 Test user: ${userId}`);
    
    if (course.teacherId !== userId) {
      console.log('❌ User does not have access to this course');
      console.log('This could be the problem!');
      
      // Let's check what the actual teacher ID should be
      const user = await prisma.user.findFirst();
      console.log(`\n🔍 Actual user in database:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      
      if (course.teacherId === user.id) {
        console.log('✅ Course belongs to the database user');
      } else {
        console.log('❌ Course does NOT belong to the database user');
      }
      
      return;
    }

    // 2. Get students
    const students = await prisma.student.findMany({
      where: { courseId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        _count: {
          select: {
            events: true,
            redemptions: true,
            consequences: true,
          },
        },
      },
      orderBy: [
        { courseId: 'asc' },
        { displayName: 'asc' },
      ],
    });

    console.log(`\n✅ Found ${students.length} students`);
    
    // Simulate API response format
    const response = { students };
    console.log('📦 API Response format:', Object.keys(response));
    
    console.log('\n👨‍🎓 Students:');
    students.slice(0, 5).forEach(student => {
      console.log(`  • ${student.displayName} (${student.currentXP} XP)`);
    });
    
    console.log('\n✅ API logic works correctly!');
    
  } catch (error) {
    console.error('❌ Error in API logic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentsApiSimple();