// Test script to check local API with authentication
const fetch = require('node-fetch');

async function testLocalAPI() {
  try {
    console.log('🔍 Testing local API endpoints...\n');
    
    // Test 1: Try to access students API without auth
    console.log('1. Testing students API without auth:');
    try {
      const response = await fetch('http://localhost:3000/api/students?courseId=53f69f65-e735-4f15-8c18-e8eae62d3158');
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`   ✅ Success: Found ${data.students?.length || 0} students`);
      } else {
        console.log(`   ❌ Failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test 2: Check if development server is running
    console.log('\n2. Testing if development server is accessible:');
    try {
      const response = await fetch('http://localhost:3000/login');
      console.log(`   Status: ${response.status}`);
      console.log(`   ✅ Server is running`);
    } catch (error) {
      console.log(`   ❌ Server not accessible: ${error.message}`);
    }
    
    // Test 3: Check courses API
    console.log('\n3. Testing courses API without auth:');
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`   ✅ Success: Found ${data.courses?.length || 0} courses`);
      } else {
        console.log(`   ❌ Failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testLocalAPI();