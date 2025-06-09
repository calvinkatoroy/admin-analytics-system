import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  CogIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Overview & Analytics' },
  { name: 'Users', href: '/users', icon: UsersIcon, description: 'User Management' },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, description: 'Advanced Reports' },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: CogIcon },
  { name: 'Logs', href: '/logs', icon: DocumentTextIcon },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected, liveStats } = useSocket();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const ProjectHeader = () => (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black">
                NoSQL MongoDB Implementation
              </h1>
              <p className="text-gray-300 text-lg">
                Admin Analytics System - Mini Project Assignment
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="project-badge">MongoDB</span>
                <span className="project-badge">Node.js</span>
                <span className="project-badge">React</span>
                <span className="project-badge">Express</span>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-xl font-bold text-blue-300">Your Name Here</div>
            <div className="text-gray-300">University/Institution Name</div>
            <div className="text-gray-300 text-sm">2024/2025 Academic Year</div>
            <a 
              href="https://github.com/yourusername/admin-analytics-mongodb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const Sidebar = ({ mobile = false }) => (
    <div className={clsx(
      "flex flex-col h-full",
      mobile ? "w-full" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ChartBarIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Analytics</span>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className="status-online"></div>
            <span className="text-xs font-medium text-green-600">Live</span>
          </div>
        )}
        {mobile && (
          <button onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 bg-white">
        {/* Primary Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Analytics
          </h3>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      'group flex flex-col p-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => mobile && setSidebarOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={clsx(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                      )} />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-8 mt-1">
                      {item.description}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Secondary Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            System
          </h3>
          <ul className="space-y-2">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={clsx(
                      'group flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => mobile && setSidebarOpen(false)}
                  >
                    <Icon className={clsx(
                      'w-5 h-5',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    )} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Live Stats in Sidebar */}
        {liveStats && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Live Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Online Users</span>
                <span className="font-bold text-blue-600">{liveStats.onlineUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-xs text-gray-500">
                  {new Date(liveStats.timestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Project Header */}
      <ProjectHeader />

      <div className="flex flex-1">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex flex-col w-full max-w-xs bg-white shadow-xl">
              <Sidebar mobile={true} />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 border-r border-gray-200 bg-white">
            <Sidebar />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top navigation bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 z-10">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                <span className="text-gray-500">Admin Analytics</span>
                <span className="text-gray-400">/</span>
                <span className="font-medium text-gray-900 capitalize">
                  {location.pathname.replace('/', '') || 'dashboard'}
                </span>
              </div>
              
              {/* Right side of header */}
              <div className="flex items-center space-x-4">
                {/* Live stats indicator */}
                {liveStats && (
                  <div className="hidden sm:flex items-center space-x-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="status-online"></div>
                      <span className="text-gray-600">
                        {liveStats.onlineUsers} online
                      </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <span className="text-gray-500">
                      Updated {new Date(liveStats.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.profile?.firstName 
                        ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
                        : user?.username || 'User'
                      }
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-center lg:text-left">
              <p className="text-gray-900 font-semibold">
                &copy; 2025 Admin Analytics Dashboard - NoSQL MongoDB Implementation
              </p>
              <p className="text-gray-600">
                Educational project demonstrating modern web development with MongoDB
              </p>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-end gap-2">
              {['MongoDB', 'Node.js', 'React', 'Express', 'Redis'].map((tech) => (
                <span 
                  key={tech}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;