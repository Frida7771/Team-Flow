export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  SELECTED = 'SELECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
}
