'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS_QUERY, CREATE_PROJECT_MUTATION } from '@/graphql/queries/project';
import { GET_TASKS_QUERY, CREATE_TASK_MUTATION, UPDATE_TASK_MUTATION } from '@/graphql/queries/task';
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
  { key: 'BACKLOG', label: 'Backlog', color: 'bg-gray-100' },
  { key: 'SELECTED', label: 'Selected', color: 'bg-blue-100' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100' },
  { key: 'DONE', label: 'Done', color: 'bg-green-100' },
] as const;

export default function DashboardPage() {
  const { setCurrentProject } = useProject();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const { data: projectsData, loading: projectsLoading, refetch: refetchProjects } = useQuery(GET_PROJECTS_QUERY);
  const [createProject] = useMutation(CREATE_PROJECT_MUTATION);
  const [createTask] = useMutation(CREATE_TASK_MUTATION);
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION);

  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useQuery(
    GET_TASKS_QUERY,
    {
      variables: { projectId: selectedProject?.id },
      skip: !selectedProject?.id,
    }
  );

  useEffect(() => {
    if (projectsData?.projects && projectsData.projects.length > 0 && !selectedProject) {
      const firstProject = projectsData.projects[0];
      setSelectedProject(firstProject);
      setCurrentProject(firstProject);
    }
  }, [projectsData, selectedProject, setCurrentProject]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await createProject({
        variables: {
          input: {
            name: newProjectName,
            description: '',
          },
        },
      });
      setNewProjectName('');
      setShowCreateProject(false);
      refetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;

    try {
      await createTask({
        variables: {
          input: {
            title: newTaskTitle,
            description: newTaskDescription,
            projectId: selectedProject.id,
          },
        },
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowCreateTask(false);
      refetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask({
        variables: {
          input: {
            id: taskId,
            status: newStatus,
          },
        },
      });
      refetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getTasksByStatus = (status: string) => {
    if (!tasksData?.tasks) return [];
    return tasksData.tasks.filter((task: Task) => task.status === status);
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Kanban Board</h1>
            <p className="text-gray-600 mt-1">Manage your tasks and projects</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projectsData?.projects.find((p: Project) => p.id === e.target.value);
                setSelectedProject(project || null);
                setCurrentProject(project || null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projectsData?.projects?.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateProject(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              New Project
            </button>
            <button
              onClick={() => setShowCreateTask(true)}
              disabled={!selectedProject}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {selectedProject ? (
        <div className="flex-1 overflow-x-auto">
        <div className="flex space-x-3 min-w-max pb-4">
          {TASK_STATUSES.map((status) => (
            <div key={status.key} className="flex-shrink-0 w-64">
                <div className={`${status.color} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{status.label}</h3>
                    <span className="text-sm text-gray-500">
                      {getTasksByStatus(status.key).length}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {getTasksByStatus(status.key).map((task: Task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          const nextStatus = TASK_STATUSES.find((s, index) => 
                            s.key === status.key && index < TASK_STATUSES.length - 1
                          )?.key;
                          if (nextStatus) {
                            handleTaskStatusChange(task.id, nextStatus);
                          }
                        }}
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                            {status.label}
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
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Project
            </button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}