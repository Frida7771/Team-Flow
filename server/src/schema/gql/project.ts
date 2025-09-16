import { gql } from 'apollo-server-express';

export const projectTypeDefs = gql`
  type Project {
    id: ID!
    name: String!
    description: String
    userId: String!
    createdAt: String!
    updatedAt: String!
    tasks: [Task!]!
  }

  input CreateProjectInput {
    name: String!
    description: String
  }

  input UpdateProjectInput {
    id: ID!
    name: String
    description: String
  }

  extend type Query {
    projects: [Project!]!
    project(id: ID!): Project
  }

  extend type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
  }
`;
