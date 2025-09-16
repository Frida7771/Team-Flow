# Team Flow - Team Collaboration Platform

A modern team collaboration and project management platform built with Next.js, Node.js, GraphQL and PostgreSQL

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Project Management**: Create, read, update, and delete projects
- **Task Management**: Create and manage tasks with drag-and-drop status updates
- **Task Status Flow**: Tasks flow through Backlog → Selected → In Progress → Done
- **Real-time Updates**: Real-time updates on project activities
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14+**: React framework with App Router
- **Apollo Client**: GraphQL client for data fetching and caching
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **React DnD**: Drag and drop functionality

### Backend
- **Node.js + Express**: Server runtime
- **Apollo Server**: GraphQL server
- **Prisma**: Modern ORM for database access
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

## Project Structure

```
Team-Flow/
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/              # App router pages
│   │   │   ├── (auth)/       # Authentication pages
│   │   │   ├── dashboard/    # Main application
│   │   │   └── layout.tsx
│   │   ├── components/       # React components
│   │   ├── graphql/         # GraphQL queries & mutations
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript types
│   └── package.json
├── server/                   # Node.js backend
│   ├── src/
│   │   ├── schema/          # GraphQL schema
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utilities
│   │   └── prisma/          # Database schema
│   └── package.json
├── shared/                   # Shared types
├── tests/                    # Test files
│   ├── test-auth-endpoints.js
│   ├── test-basic-graphql.js
│   ├── test-project-creation.js
│   └── README.md
└── docker-compose.yml       # Development setup
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Team-Flow
   ```

2. **Set up the database**
   ```bash
   # Using Docker
   docker-compose up postgres -d
   
   # Or install PostgreSQL locally
   # Create database: teamflow
   ```

3. **Set up environment variables**
   ```bash
   # Server
   cd server
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   
   # Client
   cd ../client
   # Create .env.local with NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
   ```

4. **Install dependencies**
   ```bash
   # Server
   cd server
   npm install
   
   # Client
   cd ../client
   npm install
   ```

5. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev
   
   # Terminal 2 - Client
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql

### Using Docker

```bash
# Start all services
docker-compose up

# Build and start
docker-compose up --build
```

## API Documentation

### GraphQL Schema

The API uses GraphQL with the following main types:

- **User**: User account information
- **Project**: Project management
- **Task**: Task management with status flow

### Authentication

All protected operations require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## License

This project is licensed under the MIT License.
