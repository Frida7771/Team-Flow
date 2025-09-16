#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:4000';

async function quickTest() {
  console.log('🧪 Quick GraphQL Test...\n');

  try {
    // Get token
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed, please register first');
      return;
    }

    const { data: { token } } = await loginResponse.json();
    console.log('✅ Token obtained');

    // Test project creation
    const response = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation {
            createProject(input: { name: "Quick Test Project" }) {
              id
              name
              description
              createdAt
              updatedAt
              tasks {
                id
                title
              }
            }
          }
        `,
      }),
    });

    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.log('❌ Errors:', result.errors);
    } else {
      console.log('✅ Success!');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

quickTest();
