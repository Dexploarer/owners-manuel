import React from 'react';
import {
  FileText,
  FolderOpen,
  Home,
  Layout,
  Settings,
  Sparkles,
  Menu,
  X,
  Github,
  FileCode,
  Users,
  Workflow,
  FolderKanban,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthStatus } from '@/components/AuthStatus';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', icon: Home, view: 'dashboard' as const },
  { name: 'Projects', icon: FolderOpen, view: 'projects' as const },
  { name: 'Workspaces', icon: FolderKanban, view: 'workspaces' as const },
  { name: 'Generate', icon: Sparkles, view: 'generate' as const },
  { name: 'GitHub', icon: Github, view: 'github' as const },
  { name: 'Rule Generator', icon: FileCode, view: 'rules' as const },
  { name: 'Workflows', icon: Workflow, view: 'workflows' as const },
  { name: 'Team', icon: Users, view: 'team' as const },
  { name: 'Templates', icon: Layout, view: 'templates' as const },
  { name: 'Documents', icon: FileText, view: 'documents' as const },
];

export const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen, currentView, setCurrentView, user } =
    useAppStore();

  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className='flex flex-grow flex-col overflow-y-auto bg-card border-r'>
          {/* Logo/Brand */}
          <div className='flex h-16 items-center justify-between px-6'>
            <div className='flex items-center'>
              <Sparkles className='h-8 w-8 text-primary' />
              <span className='ml-2 text-xl font-bold'>User Manual</span>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='lg:hidden'
              onClick={() => setSidebarOpen(false)}
            >
              <X className='h-5 w-5' />
            </Button>
          </div>

          {/* Navigation */}
          <nav className='flex-1 space-y-1 px-4 py-4'>
            {navigation.map(item => (
              <Button
                key={item.name}
                variant={currentView === item.view ? 'default' : 'ghost'}
                className='w-full justify-start'
                onClick={() => setCurrentView(item.view)}
              >
                <item.icon className='mr-3 h-5 w-5' />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* User Profile */}
          <div className='border-t p-4'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className='ml-3 flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>
                  {user?.name || 'User'}
                </p>
                <p className='text-xs text-muted-foreground truncate'>
                  {user?.plan || 'Free'} Plan
                </p>
              </div>
              <Button variant='ghost' size='icon'>
                <Settings className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200 ease-in-out',
          sidebarOpen ? 'lg:ml-64' : 'ml-0'
        )}
      >
        {/* Top bar */}
        <header className='flex h-16 items-center justify-between border-b bg-background px-6'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className='h-5 w-5' />
          </Button>

          <div className='flex items-center space-x-4'>
            <Button variant='outline' size='sm'>
              Feedback
            </Button>
            <Button size='sm'>Upgrade</Button>
            <AuthStatus />
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
