import { projectResolvers } from './project.resolver';
import { taskResolvers } from './task.resolver';

export const resolvers = {
  Query: {
    ...projectResolvers.Query,
    ...taskResolvers.Query,
  },
  Mutation: {
    ...projectResolvers.Mutation,
    ...taskResolvers.Mutation,
  },
};
