const { z } = require('zod');

// Define the schema exactly like in the validation file
const studentFilterSchema = z.object({
  courseId: z.string().uuid('Invalid course ID').nullable().transform(val => val || undefined),
  active: z.string().nullable().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }).optional(),
  color: z.enum(['BLUE', 'GREEN', 'YELLOW', 'RED']).nullable().transform(val => val || undefined).optional(),
  search: z.string().nullable().transform(val => val || undefined).optional(),
});

async function testValidation() {
  try {
    console.log('🧪 Testing Zod validation for query parameters...\n');
    
    // Test 1: Valid courseId like from searchParams.get()
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
      console.log('❌ Failed:', error.issues?.[0]?.message || error.message);
    }
    
    // Test 2: Null courseId (this mimics when searchParams.get() returns null)
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
      console.log('❌ Failed:', error.issues?.[0]?.message || error.message);
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
      console.log('❌ Failed:', error.issues?.[0]?.message || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testValidation();