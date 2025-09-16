#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:4000';

async function testProjectCreation() {
  console.log('🧪 Testing Project Creation Flow...\n');

  try {
    // Step 1: Register/Login to get a token
    console.log('1. Getting authentication token...');
    
    // Try to register first
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      }),
    });

    let token;
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      token = registerData.data.token;
      console.log('✅ Registration successful');
    } else {
      // Try login if registration fails (user might already exist)
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.data.token;
        console.log('✅ Login successful');
      } else {
        console.log('❌ Both registration and login failed');
        return;
      }
    }

    console.log('Token:', token.substring(0, 20) + '...');

    // Step 2: Test GraphQL project creation
    console.log('\n2. Testing GraphQL project creation...');
    const graphqlResponse = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation CreateProject($input: CreateProjectInput!) {
            createProject(input: $input) {
              id
              name
              description
              createdAt
              tasks {
                id
                title
              }
            }
          }
        `,
        variables: {
          input: {
            name: 'Test Project from Script',
            description: 'Created via test script'
          }
        }
      }),
    });

    const graphqlData = await graphqlResponse.json();
    console.log('GraphQL Response:', JSON.stringify(graphqlData, null, 2));

    if (graphqlData.errors) {
      console.log('❌ GraphQL mutation failed:');
      graphqlData.errors.forEach(error => {
        console.log('  -', error.message);
        if (error.extensions) {
          console.log('  - Extensions:', error.extensions);
        }
      });
    } else {
      console.log('✅ GraphQL mutation successful!');
      console.log('Created project:', graphqlData.data.createProject);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Project creation test completed!');
}

testProjectCreation();
