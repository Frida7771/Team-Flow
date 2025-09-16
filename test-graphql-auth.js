#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:4000';

async function testGraphQLAuth() {
  console.log('🧪 Testing GraphQL Authentication...\n');

  try {
    // Step 1: Login to get a token
    console.log('1. Logging in to get token...');
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

    if (!loginResponse.ok) {
      console.log('❌ Login failed, trying to register first...');
      
      // Try to register first
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

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        console.log('❌ Registration failed:', errorData.message);
        return;
      }
      
      console.log('✅ Registration successful, now logging in...');
      
      // Now try login again
      const loginResponse2 = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      if (!loginResponse2.ok) {
        const errorData = await loginResponse2.json();
        console.log('❌ Login failed:', errorData.message);
        return;
      }
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

    // Step 2: Test GraphQL query with token
    console.log('\n2. Testing GraphQL projects query...');
    const graphqlResponse = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query GetProjects {
            projects {
              id
              name
              description
              createdAt
            }
          }
        `,
      }),
    });

    const graphqlData = await graphqlResponse.json();
    console.log('GraphQL Response:', JSON.stringify(graphqlData, null, 2));

    // Step 3: Test GraphQL mutation with token
    console.log('\n3. Testing GraphQL createProject mutation...');
    const mutationResponse = await fetch(`${API_BASE_URL}/graphql`, {
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
            }
          }
        `,
        variables: {
          input: {
            name: 'Test Project',
            description: 'Created via GraphQL test'
          }
        }
      }),
    });

    const mutationData = await mutationResponse.json();
    console.log('GraphQL Mutation Response:', JSON.stringify(mutationData, null, 2));

    if (mutationData.errors) {
      console.log('❌ GraphQL mutation failed:', mutationData.errors);
    } else {
      console.log('✅ GraphQL mutation successful!');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 GraphQL authentication testing completed!');
}

// Run the tests
testGraphQLAuth();
