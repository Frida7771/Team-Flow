import { gql } from 'apollo-server-express';

export const taskTypeDefs = gql`
  enum TaskStatus {
    BACKLOG
    SELECTED
    IN_PROGRESS
    DONE
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: TaskStatus!
    userId: String!
    projectId: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateTaskInput {
    title: String!
    description: String
    projectId: ID!
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    status: TaskStatus
  }

  extend type Query {
    tasks(projectId: ID!): [Task!]!
    task(id: ID!): Task
  }

  extend type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
