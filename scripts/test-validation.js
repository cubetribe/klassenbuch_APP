const { studentFilterSchema } = require('./lib/validations/student.ts');

async function testValidation() {
  try {
    console.log('🧪 Testing Zod validation for query parameters...\n');
    
    // Test 1: Valid courseId
    console.log('Test 1: Valid courseId');
    const test1 = {
      courseId: '53f69f65-e735-4f15-8c18-e8eae62d3158',
      active: null,
      color: null,
      search: null
    };
    
    try {
      const result1 = studentFilterSchema.parse(test1);
      console.log('✅ Success:', result1);
    } catch (error) {
      console.log('❌ Failed:', error.issues);
    }
    
    // Test 2: Null courseId (should fail)
    console.log('\nTest 2: Null courseId');
    const test2 = {
      courseId: null,
      active: null,
      color: null,
      search: null
    };
    
    try {
      const result2 = studentFilterSchema.parse(test2);
      console.log('✅ Success:', result2);
    } catch (error) {
      console.log('❌ Failed:', error.issues);
    }
    
    // Test 3: Invalid UUID
    console.log('\nTest 3: Invalid UUID');
    const test3 = {
      courseId: 'invalid-uuid',
      active: null,
      color: null,
      search: null
    };
    
    try {
      const result3 = studentFilterSchema.parse(test3);
      console.log('✅ Success:', result3);
    } catch (error) {
      console.log('❌ Failed:', error.issues);
    }
    
    // Test 4: Valid with boolean active
    console.log('\nTest 4: Valid with boolean active');
    const test4 = {
      courseId: '53f69f65-e735-4f15-8c18-e8eae62d3158',
      active: 'true',
      color: 'GREEN',
      search: 'test'
    };
    
    try {
      const result4 = studentFilterSchema.parse(test4);
      console.log('✅ Success:', result4);
    } catch (error) {
      console.log('❌ Failed:', error.issues);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testValidation();