#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the backend API endpoints and database connectivity
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: 'test@school.com',
  password: 'Test123!',
  name: 'Test Teacher',
  schoolName: 'Test School'
};

const testCourse = {
  name: 'Klasse 5a',
  subject: 'Mathematik',
  schoolYear: '2024/2025',
  settings: {
    colors: {
      blue: { min: 80, max: 100 },
      green: { min: 50, max: 79 },
      yellow: { min: 25, max: 49 },
      red: { min: 0, max: 24 }
    },
    quickActions: {
      positive: ['+5 XP', '+10 XP'],
      negative: ['-5 XP', '-10 XP']
    }
  }
};

async function testEndpoint(name, method, path, body = null, headers = {}) {
  console.log(`\nTesting ${name}...`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.text();
    
    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (data) {
      try {
        const json = JSON.parse(data);
        console.log(`  Response:`, json);
        return { success: response.ok, data: json };
      } catch {
        console.log(`  Response:`, data.substring(0, 200));
        return { success: response.ok, data };
      }
    }
    
    return { success: response.ok };
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return { success: false, error };
  }
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('Backend Integration Tests');
  console.log('='.repeat(50));
  
  // Test 1: Check if server is running
  const healthCheck = await testEndpoint(
    'Health Check',
    'GET',
    '/api/auth/session'
  );
  
  if (!healthCheck.success) {
    console.error('\n❌ Server is not running or not accessible');
    console.log('Please ensure the server is running with: npm run dev');
    process.exit(1);
  }
  
  // Test 2: Register a new user
  const registerResult = await testEndpoint(
    'User Registration',
    'POST',
    '/api/auth/register',
    testUser
  );
  
  // Test 3: Check database connectivity via courses endpoint
  const coursesResult = await testEndpoint(
    'Courses Endpoint (DB Check)',
    'GET',
    '/api/courses'
  );
  
  // Test 4: Check SSE endpoint
  const sseResult = await testEndpoint(
    'SSE Endpoint',
    'GET',
    '/api/sse'
  );
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Test Summary:');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Server Running', success: healthCheck.success },
    { name: 'User Registration', success: registerResult.success },
    { name: 'Database Connection', success: coursesResult.success },
    { name: 'SSE Endpoint', success: sseResult.success }
  ];
  
  tests.forEach(test => {
    console.log(`${test.success ? '✅' : '❌'} ${test.name}`);
  });
  
  const passedTests = tests.filter(t => t.success).length;
  const totalTests = tests.length;
  
  console.log(`\nTotal: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Backend integration is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration:');
    console.log('1. Ensure PostgreSQL is running (docker-compose up -d)');
    console.log('2. Run database migrations (npx prisma migrate dev)');
    console.log('3. Check .env.local file for correct DATABASE_URL');
    console.log('4. Ensure next.config.js does not have "output: \'export\'"');
  }
}

// Run tests
runTests().catch(console.error);