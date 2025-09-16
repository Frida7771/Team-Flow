#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:4000';

async function detailedTest() {
  console.log('🔍 Detailed GraphQL Debug Test...\n');

  try {
    // Step 1: Test server connectivity
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ __typename }'
      }),
    });

    if (!healthResponse.ok) {
      console.log('❌ Server not responding');
      return;
    }
    console.log('✅ Server is responding');

    // Step 2: Get authentication token
    console.log('\n2. Getting authentication token...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed, trying registration...');
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        }),
      });

      if (!registerResponse.ok) {
        console.log('❌ Both login and registration failed');
        return;
      }
      console.log('✅ Registration successful');
    } else {
      console.log('✅ Login successful');
    }

    const { data: { token } } = await loginResponse.ok ? await loginResponse.json() : await registerResponse.json();
    console.log('Token:', token.substring(0, 20) + '...');

    // Step 3: Test GraphQL introspection
    console.log('\n3. Testing GraphQL introspection...');
    const introspectionResponse = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query IntrospectionQuery {
            __schema {
              mutationType {
                fields {
                  name
                  type {
                    name
                  }
                }
              }
            }
          }
        `,
      }),
    });

    const introspectionData = await introspectionResponse.json();
    console.log('Introspection result:', JSON.stringify(introspectionData, null, 2));

    // Step 4: Test simple query first
    console.log('\n4. Testing simple projects query...');
    const projectsResponse = await fetch(`${API_BASE_URL}/graphql`, {
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
            }
          }
        `,
      }),
    });

    const projectsData = await projectsResponse.json();
    console.log('Projects query result:', JSON.stringify(projectsData, null, 2));

    // Step 5: Test project creation
    console.log('\n5. Testing project creation...');
    const createResponse = await fetch(`${API_BASE_URL}/graphql`, {
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
              updatedAt
              tasks {
                id
                title
              }
            }
          }
        `,
        variables: {
          input: {
            name: 'Debug Test Project',
            description: 'Created during debug test'
          }
        }
      }),
    });

    const createData = await createResponse.json();
    console.log('Create project result:', JSON.stringify(createData, null, 2));

    if (createData.errors) {
      console.log('\n❌ ERRORS FOUND:');
      createData.errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error.message);
        if (error.extensions) {
          console.log('Extensions:', error.extensions);
        }
        if (error.path) {
          console.log('Path:', error.path);
        }
      });
    } else {
      console.log('\n✅ Project creation successful!');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('Stack:', error.stack);
  }

  console.log('\n🏁 Detailed test completed!');
}

detailedTest();
