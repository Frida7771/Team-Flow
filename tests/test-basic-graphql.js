// Simple test to check if the server is running and GraphQL is accessible
const API_BASE_URL = 'http://localhost:4000';

async function testBasicGraphQL() {
  console.log('🧪 Testing basic GraphQL connectivity...\n');

  try {
    // Test 1: Basic GraphQL introspection
    console.log('1. Testing GraphQL introspection...');
    const introspectionResponse = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query IntrospectionQuery {
            __schema {
              queryType {
                name
              }
              mutationType {
                name
              }
            }
          }
        `,
      }),
    });

    const introspectionData = await introspectionResponse.json();
    console.log('Introspection Response:', JSON.stringify(introspectionData, null, 2));

    if (introspectionData.errors) {
      console.log('❌ GraphQL introspection failed:', introspectionData.errors);
      return;
    }

    console.log('✅ GraphQL server is accessible');

    // Test 2: Try to create a project without authentication (should fail)
    console.log('\n2. Testing createProject without auth (should fail)...');
    const noAuthResponse = await fetch(`${API_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation CreateProject($input: CreateProjectInput!) {
            createProject(input: $input) {
              id
              name
              description
            }
          }
        `,
        variables: {
          input: {
            name: 'Test Project',
            description: 'Test description'
          }
        }
      }),
    });

    const noAuthData = await noAuthResponse.json();
    console.log('No Auth Response:', JSON.stringify(noAuthData, null, 2));

    if (noAuthData.errors) {
      console.log('✅ Expected error without auth:', noAuthData.errors[0].message);
    } else {
      console.log('❌ Unexpected success without auth');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Basic GraphQL test completed!');
}

testBasicGraphQL();
