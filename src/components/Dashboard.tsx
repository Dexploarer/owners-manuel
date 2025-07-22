import React from 'react';
import {
  FileText,
  FolderOpen,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';

export const Dashboard: React.FC = () => {
  const { projects, documents, user, setCurrentView } = useAppStore();

  const stats = {
    projects: projects.length,
    documents: documents.length,
    tokensUsed: user?.usage.tokensUsed || 0,
    monthlyLimit: user?.usage.monthlyLimit || 10000,
  };

  const recentDocuments = documents
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  const recentProjects = projects
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className='p-6 space-y-6'>
      {/* Welcome Section */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className='text-muted-foreground'>
            Let's create some amazing AI agent documentation today.
          </p>
        </div>
        <Button
          size='lg'
          onClick={() => setCurrentView('generate')}
          className='bg-primary hover:bg-primary/90'
        >
          <Sparkles className='mr-2 h-5 w-5' />
          Generate Documentation
        </Button>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Projects</CardTitle>
            <FolderOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.projects}</div>
            <p className='text-xs text-muted-foreground'>Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Documents</CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.documents}</div>
            <p className='text-xs text-muted-foreground'>Generated documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Token Usage</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {Math.round((stats.tokensUsed / stats.monthlyLimit) * 100)}%
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats.tokensUsed.toLocaleString()} /{' '}
              {stats.monthlyLimit.toLocaleString()} tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Plan</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold capitalize'>
              {user?.plan || 'Free'}
            </div>
            <p className='text-xs text-muted-foreground'>
              Current subscription
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <FileText className='mr-2 h-5 w-5' />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <FileText className='mx-auto h-12 w-12 mb-4 opacity-50' />
                <p>No documents yet</p>
                <p className='text-sm'>
                  Generate your first document to get started
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {recentDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-3 rounded-lg border'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='w-2 h-2 rounded-full bg-primary' />
                      <div>
                        <p className='font-medium'>{doc.title}</p>
                        <p className='text-sm text-muted-foreground'>
                          {doc.type.replace('_', ' ').toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center text-sm text-muted-foreground'>
                      <Clock className='mr-1 h-3 w-3' />
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className='mt-4'>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => setCurrentView('documents')}
              >
                View All Documents
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <FolderOpen className='mr-2 h-5 w-5' />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <FolderOpen className='mx-auto h-12 w-12 mb-4 opacity-50' />
                <p>No projects yet</p>
                <p className='text-sm'>
                  Create your first project to get started
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {recentProjects.map(project => (
                  <div key={project.id} className='p-3 rounded-lg border'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-medium'>{project.name}</h3>
                      <span className='text-sm text-muted-foreground'>
                        {project.documents.length} docs
                      </span>
                    </div>
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {project.description}
                    </p>
                    <div className='flex items-center mt-2 space-x-2'>
                      {project.techStack.slice(0, 3).map(tech => (
                        <span
                          key={tech.id}
                          className='px-2 py-1 text-xs bg-secondary rounded-full'
                        >
                          {tech.name}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className='text-xs text-muted-foreground'>
                          +{project.techStack.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className='mt-4'>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => setCurrentView('projects')}
              >
                View All Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <Button
              variant='outline'
              className='h-20 flex-col'
              onClick={() => setCurrentView('projects')}
            >
              <FolderOpen className='h-6 w-6 mb-2' />
              Create Project
            </Button>
            <Button
              variant='outline'
              className='h-20 flex-col'
              onClick={() => setCurrentView('templates')}
            >
              <FileText className='h-6 w-6 mb-2' />
              Browse Templates
            </Button>
            <Button
              variant='outline'
              className='h-20 flex-col'
              onClick={() => setCurrentView('generate')}
            >
              <Sparkles className='h-6 w-6 mb-2' />
              Generate Docs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
