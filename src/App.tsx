import React, { useEffect } from 'react';
import { MainLayout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { DocumentGenerator } from '@/components/DocumentGenerator';
import { GitHubIntegration } from '@/components/GitHubIntegration';
import { RuleGenerator } from '@/components/RuleGenerator';
import { GitHubActionsGenerator } from '@/components/GitHubActionsGenerator';
import { TeamWorkspaceComponent } from '@/components/TeamWorkspace';
import { WorkspaceManager } from '@/components/WorkspaceManager';
import { ProjectsView } from '@/components/ProjectsView';
import { TemplatesView } from '@/components/TemplatesView';
import { DocumentsView } from '@/components/DocumentsView';
import { useAppStore } from '@/store';
import { mcpClaudeClient } from '@/services/mcpClaudeClient';
import type { User } from '@/types';
import './index.css';

// Default user data - will be replaced by authentication service
const getDefaultUser = (): User => ({
  id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Developer',
  email: 'developer@example.com',
  plan: 'pro',
  usage: {
    documentsGenerated: 0,
    tokensUsed: 0,
    monthlyLimit: 50000,
    resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  },
  preferences: {
    theme: 'system',
    defaultTemplate: 'agents-md',
    notifications: {
      email: true,
      inApp: true,
    },
  },
});

// Default project setup
const getDefaultProject = () => ({
  id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'User Manual Platform',
  description:
    'AI-powered documentation generator for coding agents built with modern web technologies',
  techStack: [
    {
      id: 'react',
      name: 'React',
      category: 'framework' as const,
      version: '19.0.0',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'language' as const,
      version: '5.0.0',
    },
    { id: 'bun', name: 'Bun', category: 'tool' as const, version: '1.2.16' },
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      category: 'framework' as const,
      version: '4.0.6',
    },
    {
      id: 'zustand',
      name: 'Zustand',
      category: 'tool' as const,
      version: '5.0.6',
    },
  ],
  team: [],
  templates: [],
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export function App(): React.ReactElement {
  const { currentView, currentProject, setUser, setCurrentProject } =
    useAppStore();

  useEffect(() => {
    // Check for OAuth session from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
      // Set the auth session in MCP client
      mcpClaudeClient.setAuthSession(sessionId);
      // Remove session from URL to keep it clean
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Initialize user and project data on first load
    setUser(getDefaultUser());
    setCurrentProject(getDefaultProject());
  }, [setUser, setCurrentProject]);

  const renderCurrentView = (): React.ReactElement => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectsView />;
      case 'generate':
        return <DocumentGenerator />;
      case 'github':
        return (
          <div className='p-6'>
            <GitHubIntegration />
          </div>
        );
      case 'rules':
        return (
          <div className='p-6'>
            <RuleGenerator
              repositoryName={currentProject?.name ?? 'Project'}
              repositoryDescription={currentProject?.description ?? ''}
              techStack={currentProject?.techStack ?? []}
            />
          </div>
        );
      case 'workflows':
        return (
          <div className='p-6'>
            <GitHubActionsGenerator />
          </div>
        );
      case 'team':
        return (
          <div className='p-6'>
            <TeamWorkspaceComponent />
          </div>
        );
      case 'workspaces':
        return <WorkspaceManager projectId={currentProject?.id} />;
      case 'templates':
        return <TemplatesView />;
      case 'documents':
        return <DocumentsView />;
      default:
        return <Dashboard />;
    }
  };

  return <MainLayout>{renderCurrentView()}</MainLayout>;
}

export default App;
