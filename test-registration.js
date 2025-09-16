// Test registration flow
const testRegistration = async () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'password123'
  };
  
  console.log('Testing registration with:', testUser);
  
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              token
              user {
                id
                email
                username
              }
            }
          }
        `,
        variables: {
          input: testUser
        }
      })
    });
    
    const result = await response.json();
    console.log('Registration result:', result);
    
    if (result.errors) {
      console.error('Registration errors:', result.errors);
    } else {
      console.log('✅ Registration successful!');
      console.log('Token:', result.data.register.token);
      console.log('User:', result.data.register.user);
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Run test
testRegistration();
