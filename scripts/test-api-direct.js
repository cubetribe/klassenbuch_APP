const fetch = require('node-fetch');

async function testApiDirect() {
  try {
    console.log('🔍 Testing API directly...\n');
    
    const courseId = '53f69f65-e735-4f15-8c18-e8eae62d3158';
    const baseUrl = 'https://klassenbuch-app-3xol-5sjl0ipzr-cubetribes-projects.vercel.app';
    
    // Test login first
    console.log('🔐 Testing login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teacher@school.com',
        password: 'demo123',
        redirect: false
      })
    });
    
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('Got cookies:', !!cookies);
      
      // Test students API
      console.log('\n👨‍🎓 Testing students API...');
      const studentsResponse = await fetch(`${baseUrl}/api/students?courseId=${courseId}`, {
        headers: {
          'Cookie': cookies || ''
        }
      });
      
      console.log('Students API status:', studentsResponse.status);
      console.log('Students API status text:', studentsResponse.statusText);
      
      if (!studentsResponse.ok) {
        const errorText = await studentsResponse.text();
        console.log('Error response:', errorText);
      } else {
        const data = await studentsResponse.json();
        console.log('Success! Got', data.students?.length || 0, 'students');
      }
    } else {
      console.log('Login failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testApiDirect();