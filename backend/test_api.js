// Test API endpoints
// You can run this in a browser console or create a test file

const API_BASE_URL = 'http://localhost:5000/api';

// Test login first
async function testLogin() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'navas@gmail.com',
        password: 'your_password_here',
        role: 'student'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success) {
      const token = data.token;
      
      // Test get current user
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userData = await userResponse.json();
      console.log('User data:', userData);
      
      // Test leaderboard
      const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const leaderboardData = await leaderboardResponse.json();
      console.log('Leaderboard data:', leaderboardData);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Uncomment to run the test
// testLogin();
