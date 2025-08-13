async function testStudentsAPI() {
  try {
    console.log('Testing Students API on Production...\n');
    
    // Direkt die Students API aufrufen mit einem bekannten courseId
    const courseId = '53f69f65-e735-4f15-8c18-e8eae62d3158';
    const url = `https://klassenbuch-app-3xol.vercel.app/api/students?courseId=${courseId}`;
    
    console.log('Fetching:', url);
    
    const response = await fetch(url);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('\nResponse Body (first 500 chars):');
    console.log(text.substring(0, 500));
    
    // Versuchen als JSON zu parsen
    try {
      const json = JSON.parse(text);
      console.log('\nParsed as JSON:');
      console.log('Has students property?', 'students' in json);
      if (json.students) {
        console.log('Students is array?', Array.isArray(json.students));
        console.log('Number of students:', json.students.length);
      }
    } catch (e) {
      console.log('\nCould not parse as JSON - likely HTML redirect');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStudentsAPI();