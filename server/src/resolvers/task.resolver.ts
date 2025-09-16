import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export const taskResolvers = {
  Query: {
    tasks: async (_: any, { projectId }: { projectId: string }, context: any) => {
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return taskService.getTasksByProjectId(projectId, context.user.userId);
    },
    task: async (_: any, { id }: { id: string }, context: any) => {
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return taskService.getTaskById(id, context.user.userId);
    },
  },
  Mutation: {
    createTask: async (_: any, { input }: { input: { title: string; description?: string; projectId: string } }, context: any) => {
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return taskService.createTask(context.user.userId, input.projectId, input.title, input.description);
    },
    updateTask: async (_: any, { input }: { input: { id: string; title?: string; description?: string; status?: string } }, context: any) => {
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return taskService.updateTask(input.id, context.user.userId, {
        title: input.title,
        description: input.description,
        status: input.status as any,
      });
    },
    deleteTask: async (_: any, { id }: { id: string }, context: any) => {
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return taskService.deleteTask(id, context.user.userId);
    },
  },
};
