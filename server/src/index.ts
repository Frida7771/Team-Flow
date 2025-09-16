import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { verifyToken } from './utils/jwt';
import { errorMiddleware } from './middleware/error.middleware';
import { config } from './config';
import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/auth', authRoutes);

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    console.log('Apollo Server context called');
    console.log('Request headers:', req.headers);
    
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decoded = verifyToken(token);
          console.log('GraphQL context - User authenticated:', decoded.userId);
          return { user: decoded };
        } catch (error) {
          console.log('GraphQL context - Invalid token:', error.message);
          // Return empty context, let resolvers handle auth
        }
      }
    }
    
    console.log('GraphQL context - No token provided');
    return { user: null };
  },
  formatError: (error) => {
    console.error('Apollo Server Error:', error);
    return error;
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.use(errorMiddleware);

  app.listen(config.port, () => {
    console.log(`🚀 Server ready at http://localhost:${config.port}`);
    console.log(`📊 GraphQL endpoint: http://localhost:${config.port}${server.graphqlPath}`);
    console.log(`🔐 Auth endpoints: http://localhost:${config.port}/auth`);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
