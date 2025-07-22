import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Grid3X3,
  List,
  FolderKanban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';
import { WorkspaceBoard } from './WorkspaceBoard';
import type { ProjectWorkspace, WorkspaceTemplate } from '@/types';

interface WorkspaceManagerProps {
  projectId?: string;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  projectId,
}) => {
  const { currentProject } = useAppStore();
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<ProjectWorkspace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Initialize workspaces for current project
  useEffect(() => {
    if (!currentProject) return;

    const defaultWorkspaces: ProjectWorkspace[] = [
      {
        id: crypto.randomUUID(),
        name: 'Development Workflow',
        description: 'Main development workspace for project lifecycle',
        project_id: currentProject.id,
        phases: [],
        settings: {
          default_view: 'kanban',
          auto_advance: false,
          notifications_enabled: true,
          phase_templates_enabled: true,
          collaboration_mode: 'team',
          integration_settings: {
            github_sync: true,
            auto_generate_docs: true,
            mcp_enabled: true,
          },
        },
        collaborators: [
          {
            user_id: crypto.randomUUID(),
            name: 'Project Owner',
            email: 'owner@example.com',
            role: 'owner',
            permissions: {
              can_edit_phases: true,
              can_move_items: true,
              can_create_items: true,
              can_delete_items: true,
              can_invite_users: true,
            },
            joined_at: new Date(),
          },
        ],
        activity: [],
        created_by: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Documentation Hub',
        description: 'Centralized documentation management workspace',
        project_id: currentProject.id,
        phases: [],
        settings: {
          default_view: 'list',
          auto_advance: true,
          notifications_enabled: true,
          phase_templates_enabled: false,
          collaboration_mode: 'team',
          integration_settings: {
            github_sync: false,
            auto_generate_docs: true,
            mcp_enabled: true,
          },
        },
        collaborators: [],
        activity: [],
        created_by: crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    setWorkspaces(defaultWorkspaces);
  }, [currentProject]);

  const filteredWorkspaces = workspaces.filter(
    workspace =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateWorkspace = (): void => {
    setShowCreateModal(true);
  };

  const handleWorkspaceSelect = (workspace: ProjectWorkspace): void => {
    setSelectedWorkspace(workspace);
  };

  if (selectedWorkspace) {
    return (
      <WorkspaceBoard
        workspace={selectedWorkspace}
        onBack={() => setSelectedWorkspace(null)}
      />
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <FolderKanban className='mr-3 h-8 w-8 text-primary' />
            Workspaces
          </h1>
          <p className='text-muted-foreground'>
            Organize your project phases with drag-and-drop kanban boards
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <div className='flex items-center border rounded-lg'>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='rounded-r-none'
            >
              <Grid3X3 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='rounded-l-none'
            >
              <List className='h-4 w-4' />
            </Button>
          </div>

          <Button onClick={handleCreateWorkspace} className='flex items-center'>
            <Plus className='mr-2 h-4 w-4' />
            Create Workspace
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search workspaces...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        <Button variant='outline' size='sm'>
          <Filter className='mr-2 h-4 w-4' />
          Filter
        </Button>
      </div>

      {/* Project Context */}
      {currentProject && (
        <Card className='bg-primary/5 border-primary/20'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-primary'>
                  {currentProject.name}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {currentProject.description}
                </p>
              </div>
              <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                <div className='flex items-center'>
                  <Users className='mr-1 h-4 w-4' />
                  {currentProject.team?.length ?? 0} members
                </div>
                <div className='flex items-center'>
                  <FolderKanban className='mr-1 h-4 w-4' />
                  {workspaces.length} workspaces
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workspaces Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {filteredWorkspaces.map(workspace => (
          <Card
            key={workspace.id}
            className='cursor-pointer hover:shadow-md transition-shadow'
            onClick={() => handleWorkspaceSelect(workspace)}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>{workspace.name}</CardTitle>
                  {workspace.description && (
                    <p className='text-sm text-muted-foreground mt-1'>
                      {workspace.description}
                    </p>
                  )}
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={e => {
                    e.stopPropagation();
                    // Handle workspace settings
                  }}
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>

            <CardContent className='pt-0'>
              <div className='space-y-3'>
                {/* Workspace Stats */}
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center text-muted-foreground'>
                    <BarChart3 className='mr-1 h-4 w-4' />
                    {workspace.phases.length} phases
                  </div>
                  <div className='flex items-center text-muted-foreground'>
                    <Users className='mr-1 h-4 w-4' />
                    {workspace.collaborators.length} members
                  </div>
                </div>

                {/* Integration Status */}
                <div className='flex items-center space-x-2'>
                  {workspace.settings.integration_settings.github_sync && (
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'>
                      GitHub
                    </span>
                  )}
                  {workspace.settings.integration_settings.mcp_enabled && (
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
                      MCP
                    </span>
                  )}
                  {workspace.settings.integration_settings
                    .auto_generate_docs && (
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800'>
                      Auto-Docs
                    </span>
                  )}
                </div>

                {/* Last Updated */}
                <div className='flex items-center text-xs text-muted-foreground'>
                  <Calendar className='mr-1 h-3 w-3' />
                  Updated {workspace.updated_at.toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredWorkspaces.length === 0 && (
          <div className='col-span-full'>
            <Card className='p-8 text-center border-dashed'>
              <FolderKanban className='mx-auto h-12 w-12 text-muted-foreground/50 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                No workspaces found
              </h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery
                  ? 'No workspaces match your search criteria.'
                  : 'Create your first workspace to get started with project organization.'}
              </p>
              <Button onClick={handleCreateWorkspace}>
                <Plus className='mr-2 h-4 w-4' />
                Create Workspace
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Button variant='outline' className='justify-start h-auto p-4'>
              <div className='text-left'>
                <div className='font-medium'>Development Template</div>
                <div className='text-sm text-muted-foreground'>
                  Pre-configured phases for software development
                </div>
              </div>
            </Button>

            <Button variant='outline' className='justify-start h-auto p-4'>
              <div className='text-left'>
                <div className='font-medium'>Documentation Workspace</div>
                <div className='text-sm text-muted-foreground'>
                  Organize and manage project documentation
                </div>
              </div>
            </Button>

            <Button variant='outline' className='justify-start h-auto p-4'>
              <div className='text-left'>
                <div className='font-medium'>Custom Workflow</div>
                <div className='text-sm text-muted-foreground'>
                  Build your own phase-based workflow
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
