// Simple API test for profile update
const fetch = require('node-fetch');

const testProfileAPI = async () => {
  try {
    console.log('Testing profile update API...');
    
    // First, let's try to register a test user
    const registerData = {
      name: 'Test User',
      username: 'testuser123',
      email: 'testuser@example.com',
      password: 'testpassword',
      role: 'student',
      university: 'Test University',
      major: 'Computer Science',
      graduationYear: 2025
    };

    console.log('1. Attempting to register test user...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    const registerResult = await registerResponse.json();
    console.log('Register response:', registerResult);

    if (!registerResult.success && !registerResult.error?.includes('already exists')) {
      console.error('Registration failed:', registerResult);
      return;
    }

    // Now try to login
    console.log('\n2. Attempting to login...');
    const loginData = {
      email: 'testuser@example.com',
      password: 'testpassword',
      role: 'student'
    };

    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const loginResult = await loginResponse.json();
    console.log('Login response:', loginResult);

    if (!loginResult.success) {
      console.error('Login failed:', loginResult);
      return;
    }

    const token = loginResult.token;
    console.log('Token received:', token ? 'Yes' : 'No');

    // Now test profile update
    console.log('\n3. Attempting profile update...');
    const updateData = {
      bio: 'This is my updated bio',
      location: 'New York, NY',
      website: 'https://testuser.com',
      githubProfile: 'https://github.com/testuser123',
      linkedinProfile: 'https://linkedin.com/in/testuser123'
    };

    const updateResponse = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    console.log('Profile update response:', updateResult);

    if (updateResult.success) {
      console.log('✅ Profile update successful!');
      console.log('Updated profile data:', updateResult.data);
    } else {
      console.log('❌ Profile update failed:', updateResult);
    }

  } catch (error) {
    console.error('Error during API test:', error);
  }
};

testProfileAPI();
