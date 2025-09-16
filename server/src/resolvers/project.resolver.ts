import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export const projectResolvers = {
  Query: {
    projects: async (_: any, __: any, context: any) => {
      console.log('Projects query - Context:', context);
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return projectService.getProjectsByUserId(context.user.userId);
    },
    project: async (_: any, { id }: { id: string }, context: any) => {
      console.log('Project query - Context:', context);
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return projectService.getProjectById(id, context.user.userId);
    },
  },
  Mutation: {
    createProject: async (_: any, { input }: { input: { name: string; description?: string } }, context: any) => {
      console.log('Create project mutation - Context:', context);
      console.log('Create project mutation - Input:', input);
      
      // More robust authentication check
      if (!context || !context.user || !context.user.userId) {
        console.error('Authentication failed - missing user context');
        throw new Error('Authentication required');
      }
      
      console.log('User authenticated:', context.user.userId);
      
      try {
        const result = await projectService.createProject(context.user.userId, input.name, input.description);
        console.log('Create project mutation - Result:', result);
        
        // Ensure we return a valid project object
        if (!result) {
          console.error('ProjectService returned null/undefined');
          throw new Error('Failed to create project');
        }
        
        return result;
      } catch (error) {
        console.error('Create project mutation - Error:', error);
        throw error;
      }
    },
    updateProject: async (_: any, { input }: { input: { id: string; name?: string; description?: string } }, context: any) => {
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return projectService.updateProject(input.id, context.user.userId, {
        name: input.name,
        description: input.description,
      });
    },
    deleteProject: async (_: any, { id }: { id: string }, context: any) => {
      if (!context || !context.user || !context.user.userId) {
        throw new Error('Authentication required');
      }
      return projectService.deleteProject(id, context.user.userId);
    },
  },
};
