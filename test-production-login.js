const fetch = require('node-fetch');

async function testProductionLogin() {
  try {
    console.log('Testing production login...\n');
    
    // Get CSRF token first
    const csrfResponse = await fetch('https://klassenbuch-app-3xol.vercel.app/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('CSRF Token received:', csrfData.csrfToken ? 'Yes' : 'No');
    
    // Try to login
    const loginResponse = await fetch('https://klassenbuch-app-3xol.vercel.app/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teacher@school.com',
        password: 'demo123',
        csrfToken: csrfData.csrfToken
      })
    });
    
    console.log('\nLogin Response Status:', loginResponse.status);
    console.log('Login Response Headers:', loginResponse.headers.raw());
    
    const text = await loginResponse.text();
    console.log('\nResponse Body:', text.substring(0, 500));
    
  } catch (error) {
    console.error('Error testing production:', error.message);
  }
}

testProductionLogin();