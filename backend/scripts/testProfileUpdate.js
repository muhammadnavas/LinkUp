// Test script for profile update API endpoint
const fetch = require('node-fetch');

const testProfileUpdate = async () => {
  try {
    console.log('Testing profile update API...');
    
    // Test data with various scenarios
    const testCases = [
      {
        name: 'Basic Profile Update',
        data: {
          bio: 'Updated bio',
          location: 'New York'
        }
      },
      {
        name: 'Profile with URLs',
        data: {
          website: 'https://example.com',
          githubProfile: 'https://github.com/testuser',
          linkedinProfile: 'https://linkedin.com/in/testuser'
        }
      },
      {
        name: 'Profile with empty strings',
        data: {
          bio: '',
          location: '',
          website: '',
          githubProfile: '',
          linkedinProfile: ''
        }
      }
    ];

    // First login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpassword',
        role: 'student'
      })
    });

    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult.success ? 'Success' : 'Failed');

    if (!loginResult.success) {
      console.log('Cannot test profile update without valid login');
      return;
    }

    const token = loginResult.token;

    // Test each case
    for (const testCase of testCases) {
      console.log(`\nTesting: ${testCase.name}`);
      
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Success');
      } else {
        console.log('❌ Failed:', result.error);
        if (result.details) {
          console.log('Details:', result.details);
        }
      }
    }

  } catch (error) {
    console.error('Test error:', error.message);
  }
};

testProfileUpdate();
