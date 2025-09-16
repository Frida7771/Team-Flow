'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, removeToken, isAuthenticated } from '@/lib/auth';
import { useProject } from '@/contexts/ProjectContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { currentProject } = useProject();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(200); // 进一步减小宽度
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const response = await authAPI.getMe();
        setUser(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch user:', err);
        setError(err.message);
        removeToken();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setSidebarExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(400, startWidth + (e.clientX - startX)));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar - 可调整宽度 */}
      <div 
        className={`fixed top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
          sidebarExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } overflow-hidden`}
        style={{ 
          left: '0px',
          width: `${sidebarExpanded ? sidebarWidth : 0}px`
        }}
      >
        <div className="p-4 h-full overflow-y-auto">
          {/* Project Info */}
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-blue-600 font-bold">P</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">TeamFlow</div>
              <div className="text-sm text-gray-500">Software project</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <a
              href="/dashboard"
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              <span>Kanban Board</span>
            </a>

            <a
              href="/dashboard/projects"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Projects</span>
            </a>

            <a
              href="/dashboard/settings"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Sidebar Resizer */}
      {sidebarExpanded && (
        <div
          className={`fixed top-0 h-full w-1 bg-gray-300 cursor-col-resize z-20 resizer ${
            isResizing ? 'bg-gray-400' : ''
          }`}
          style={{ left: `${sidebarWidth}px` }}
          onMouseDown={handleSidebarResize}
          onClick={(e) => {
            e.stopPropagation();
            setSidebarExpanded(false);
          }}
          title="Click to collapse sidebar"
        ></div>
      )}


      {/* Main Content */}
      <div 
        className={`flex-1 layout-transition ${isResizing ? 'resizing' : ''}`}
        style={{ 
          marginLeft: `${sidebarExpanded ? sidebarWidth + 4 : 0}px`
        }}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-md"
                title="Toggle sidebar"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Projects</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {currentProject ? (
                  <>
                    <span className="text-gray-900 font-medium">{currentProject.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-900 font-medium">Kanban Board</span>
                  </>
                ) : (
                  <span className="text-gray-900 font-medium">Dashboard</span>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}