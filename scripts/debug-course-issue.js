const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugCourseIssue() {
  try {
    console.log('🔍 Debugging course issue...\n');
    
    // Check if the courseId in the error exists
    const problematicCourseId = '53f69f65-e735-4f15-8c18-e8eae62d3158';
    
    console.log(`❓ Looking for course: ${problematicCourseId}`);
    const problematicCourse = await prisma.course.findUnique({
      where: { id: problematicCourseId }
    });
    
    if (!problematicCourse) {
      console.log('❌ Course NOT found! This is the problem.');
    } else {
      console.log('✅ Course found:', problematicCourse.name);
    }
    
    // Show all current courses
    console.log('\n📚 All current courses:');
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        subject: true,
        _count: {
          select: {
            students: true
          }
        }
      }
    });
    
    allCourses.forEach(course => {
      console.log(`  • ${course.name} - ${course.subject}`);
      console.log(`    ID: ${course.id}`);
      console.log(`    Students: ${course._count.students}`);
      console.log('');
    });
    
    // Check if there are students for any course
    const totalStudents = await prisma.student.count();
    console.log(`👨‍🎓 Total students in database: ${totalStudents}`);
    
    if (totalStudents > 0) {
      console.log('\n📊 Students by course:');
      for (const course of allCourses) {
        const students = await prisma.student.findMany({
          where: { courseId: course.id },
          select: { displayName: true, currentXP: true }
        });
        
        if (students.length > 0) {
          console.log(`\n  ${course.name} (${students.length} students):`);
          students.slice(0, 5).forEach(student => {
            console.log(`    - ${student.displayName} (${student.currentXP} XP)`);
          });
          if (students.length > 5) {
            console.log(`    ... and ${students.length - 5} more`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCourseIssue();