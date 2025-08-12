// Test Login with real credentials

async function testLogin() {
  console.log('Testing login with demo credentials...');
  
  try {
    // Login via API
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teacher@school.com',
        password: 'demo123',
        redirect: false,
      }),
    });
    
    console.log('Login response status:', response.status);
    const cookies = response.headers.get('set-cookie');
    console.log('Cookies set:', cookies ? 'Yes' : 'No');
    
    // Get session
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: {
        Cookie: cookies || '',
      },
    });
    
    const session = await sessionResponse.json();
    console.log('Session:', session);
    
    // Test courses endpoint with authentication
    const coursesResponse = await fetch('http://localhost:3000/api/courses', {
      headers: {
        Cookie: cookies || '',
      },
    });
    
    if (coursesResponse.ok) {
      const courses = await coursesResponse.json();
      console.log('Courses:', courses);
    } else {
      console.log('Courses error:', coursesResponse.status);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();