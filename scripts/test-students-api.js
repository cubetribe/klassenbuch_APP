const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStudentsAPI() {
  try {
    console.log('🔍 Testing Students API...\n');
    
    // Get a course ID from the database
    const course = await prisma.course.findFirst();
    if (!course) {
      console.log('❌ No courses found!');
      return;
    }
    
    console.log(`📚 Testing with course: ${course.name} (ID: ${course.id})`);
    
    // Test the exact same query that's failing
    const courseId = course.id;
    console.log(`\n🔍 Testing courseId validation: ${courseId}`);
    
    // Test UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValidUUID = uuidRegex.test(courseId);
    console.log(`UUID is valid: ${isValidUUID}`);
    
    if (!isValidUUID) {
      console.log('❌ Invalid UUID format detected!');
      return;
    }
    
    // Get students for this course
    const students = await prisma.student.findMany({
      where: {
        courseId: courseId
      },
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
    });
    
    console.log(`\n👨‍🎓 Found ${students.length} students for this course:`);
    
    students.forEach(student => {
      console.log(`  • ${student.displayName} (${student.internalCode}) - ${student.currentXP} XP - ${student.currentColor}`);
    });
    
    // Test if there are any courses where the user has no access
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ No user found!');
      return;
    }
    
    // Check if course belongs to user
    if (course.teacherId !== user.id) {
      console.log(`❌ Course doesn't belong to user! Course teacherId: ${course.teacherId}, User ID: ${user.id}`);
    } else {
      console.log(`✅ Course access OK - Teacher ID matches`);
    }
    
    console.log('\n✅ Students API test complete!');
    
  } catch (error) {
    console.error('❌ Error testing students API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentsAPI();