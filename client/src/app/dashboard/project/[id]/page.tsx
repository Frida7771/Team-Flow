'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT_QUERY, UPDATE_PROJECT_MUTATION, DELETE_PROJECT_MUTATION } from '@/graphql/queries/project';
import { GET_TASKS_QUERY, CREATE_TASK_MUTATION, UPDATE_TASK_MUTATION, DELETE_TASK_MUTATION } from '@/graphql/queries/task';
import { useProject } from '@/contexts/ProjectContext';

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'BACKLOG' | 'SELECTED' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
}

const TASK_STATUSES = [
  { key: 'BACKLOG', label: 'Backlog', color: 'bg-gray-100', textColor: 'text-gray-700' },
  { key: 'SELECTED', label: 'Selected', color: 'bg-blue-100', textColor: 'text-blue-700' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { key: 'DONE', label: 'Done', color: 'bg-green-100', textColor: 'text-green-700' },
] as const;

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { setCurrentProject } = useProject();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');

  const { data: projectData, loading: projectLoading, refetch: refetchProject } = useQuery(
    GET_PROJECT_QUERY,
    {
      variables: { id: params.id },
    }
  );

  const [createTask] = useMutation(CREATE_TASK_MUTATION);
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION);
  const [deleteTask] = useMutation(DELETE_TASK_MUTATION);
  const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION);
  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION);

  const project = projectData?.project;

  useEffect(() => {
    if (project) {
      setEditProjectName(project.name);
      setEditProjectDescription(project.description || '');
      setCurrentProject(project);
    }
  }, [project, setCurrentProject]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !project) return;

    try {
      await createTask({
        variables: {
          input: {
            title: newTaskTitle,
            description: newTaskDescription,
            projectId: project.id,
          },
        },
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowCreateTask(false);
      refetchProject();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, newStatus: string) => {
    try {
      await updateTask({
        variables: {
          input: {
            id: taskId,
            status: newStatus,
          },
        },
      });
      refetchProject();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask({
        variables: { id: taskId },
      });
      refetchProject();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjectName.trim() || !project) return;

    try {
      await updateProject({
        variables: {
          input: {
            id: project.id,
            name: editProjectName,
            description: editProjectDescription,
          },
        },
      });
      setShowEditProject(false);
      refetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await deleteProject({
        variables: { id: project.id },
      });
      // Redirect to dashboard after deletion
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getTasksByStatus = (status: string) => {
    if (!project?.tasks) return [];
    return project.tasks.filter((task: Task) => task.status === status);
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-1">{project.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowEditProject(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Edit Project
            </button>
            <button
              onClick={() => setShowCreateTask(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              New Task
            </button>
            <button
              onClick={handleDeleteProject}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex space-x-3 min-w-max pb-4">
          {TASK_STATUSES.map((status) => (
            <div key={status.key} className="flex-shrink-0 w-64">
              <div className={`${status.color} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-medium ${status.textColor}`}>{status.label}</h3>
                  <span className="text-sm text-gray-500">
                    {getTasksByStatus(status.key).length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {getTasksByStatus(status.key).map((task: Task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete task"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {TASK_STATUSES.map((nextStatus) => (
                            nextStatus.key !== status.key && (
                              <button
                                key={nextStatus.key}
                                onClick={() => handleUpdateTask(task.id, nextStatus.key)}
                                className={`px-2 py-1 text-xs rounded ${nextStatus.color} ${nextStatus.textColor} hover:opacity-80`}
                              >
                                Move to {nextStatus.label}
                              </button>
                            )
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {getTasksByStatus(status.key).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No tasks in {status.label.toLowerCase()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditProject(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}