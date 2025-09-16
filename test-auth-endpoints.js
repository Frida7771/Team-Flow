#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:4000';

async function testAuthEndpoints() {
  console.log('🧪 Testing Auth REST Endpoints...\n');

  // Test 1: Register a new user
  console.log('1. Testing user registration...');
  try {
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }),
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      console.log('   Token:', registerData.data.token.substring(0, 20) + '...');
      console.log('   User:', registerData.data.user.email);
      
      // Test 2: Login with the same user
      console.log('\n2. Testing user login...');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful');
        console.log('   Token:', loginData.data.token.substring(0, 20) + '...');
        
        // Test 3: Get user info with token
        console.log('\n3. Testing get user info...');
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`,
            'Content-Type': 'application/json',
          },
        });

        const meData = await meResponse.json();
        
        if (meResponse.ok) {
          console.log('✅ Get user info successful');
          console.log('   User:', meData.data.email);
        } else {
          console.log('❌ Get user info failed:', meData.message);
        }
      } else {
        console.log('❌ Login failed:', loginData.message);
      }
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Auth endpoint testing completed!');
}

// Run the tests
testAuthEndpoints();
