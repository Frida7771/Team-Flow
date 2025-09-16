import { baseTypeDefs } from './gql/base';
import { projectTypeDefs } from './gql/project';
import { taskTypeDefs } from './gql/task';

export const typeDefs = [
  baseTypeDefs,
  projectTypeDefs,
  taskTypeDefs,
];
