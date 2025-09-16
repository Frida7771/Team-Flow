import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProjectService {
  async createProject(userId: string, name: string, description?: string) {
    console.log('ProjectService.createProject - userId:', userId);
    console.log('ProjectService.createProject - name:', name);
    console.log('ProjectService.createProject - description:', description);
    
    if (!userId || !name) {
      throw new Error('User ID and project name are required');
    }
    
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
      
      const result = await prisma.project.create({
        data: {
          name,
          description,
          userId,
        },
        include: {
          tasks: true,
        },
      });
      
      console.log('ProjectService.createProject - result:', result);
      
      if (!result || !result.id) {
        throw new Error('Failed to create project - invalid result');
      }
      
      // FIX: Ensure tasks is always an array (empty array for new projects)
      return {
        ...result,
        tasks: result.tasks ?? [],  // Use nullish coalescing to default to empty array
        createdAt: result.createdAt.toISOString(), // Convert Date to String
        updatedAt: result.updatedAt.toISOString(), // Convert Date to String
      };
    } catch (error) {
      console.error('ProjectService.createProject - error:', error);
      
      if (error.code === 'P2002') {
        throw new Error('Project with this name already exists');
      } else if (error.code === 'P2003') {
        throw new Error('Invalid user ID');
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
  }

  async getProjectsByUserId(userId: string) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // FIX: Ensure each project has tasks as an array
    return projects.map(project => ({
      ...project,
      tasks: project.tasks ?? [],
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }));
  }

  async getProjectById(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        tasks: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // FIX: Ensure tasks is an array
    return {
      ...project,
      tasks: project.tasks ?? [],
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }

  async updateProject(id: string, userId: string, data: { name?: string; description?: string }) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
      include: {
        tasks: true,
      },
    });

    // FIX: Ensure tasks is an array
    return {
      ...updated,
      tasks: updated.tasks ?? [],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteProject(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    await prisma.project.delete({
      where: { id },
    });

    return true;
  }
}