import React, { useState } from 'react';
import {
  Users,
  Plus,
  Settings,
  Crown,
  UserPlus,
  Mail,
  Shield,
  Github,
  FileText,
  Folder,
  MoreHorizontal,
  Star,
  Clock,
  Edit3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store';
import type { TeamWorkspace, TeamMember, Project, Template } from '@/types';

interface TeamWorkspaceComponentProps {
  workspace?: TeamWorkspace;
  onWorkspaceSelect?: (workspace: TeamWorkspace) => void;
}

const getDefaultWorkspace = (): TeamWorkspace => ({
  id: `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: 'Development Team',
  description: 'AI-powered documentation and collaboration workspace',
  owner_id: `owner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  members: [
    {
      id: `member_${Date.now()}_1`,
      name: 'Team Lead',
      email: 'lead@example.com',
      role: 'owner',
    },
    {
      id: `member_${Date.now()}_2`,
      name: 'Senior Developer',
      email: 'senior@example.com',
      role: 'admin',
    },
    {
      id: `member_${Date.now()}_3`,
      name: 'Developer',
      email: 'dev@example.com',
      role: 'member',
    },
  ],
  projects: [],
  github_integrations: [],
  shared_templates: [],
  permissions: {
    create_projects: true,
    manage_templates: true,
    invite_members: true,
    configure_github: true,
  },
  created_at: new Date(),
  updated_at: new Date(),
});

const sharedTemplates: Template[] = [
  {
    id: 'shared-1',
    name: 'Team CLAUDE.md Standard',
    category: 'agents-md',
    framework: 'any',
    language: 'any',
    content: {
      sections: [],
      metadata: { version: '1.0', lastUpdated: new Date(), compatibility: [] },
    },
    variables: [],
    usage: {
      totalUses: 45,
      lastUsed: new Date(),
      successRate: 0.95,
      avgGenerationTime: 30000,
    },
    isCustom: true,
    createdBy: 'user-1',
  },
  {
    id: 'shared-2',
    name: 'TypeScript .cursorrules',
    category: 'cursor-rules',
    framework: 'typescript',
    language: 'typescript',
    content: {
      sections: [],
      metadata: { version: '1.2', lastUpdated: new Date(), compatibility: [] },
    },
    variables: [],
    usage: {
      totalUses: 32,
      lastUsed: new Date(),
      successRate: 0.92,
      avgGenerationTime: 25000,
    },
    isCustom: true,
    createdBy: 'user-2',
  },
];

export const TeamWorkspaceComponent: React.FC<TeamWorkspaceComponentProps> = ({
  workspace = getDefaultWorkspace(),
  onWorkspaceSelect,
}) => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'templates' | 'settings'
  >('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const isOwner = workspace.owner_id === user?.id;
  const isAdmin =
    workspace.members.find(m => m.id === user?.id)?.role === 'admin';
  const canManage = isOwner || isAdmin;

  const getRoleIcon = (role: string): React.ReactNode => {
    switch (role) {
      case 'owner':
        return <Crown className='h-3 w-3 text-yellow-600' />;
      case 'admin':
        return <Shield className='h-3 w-3 text-blue-600' />;
      default:
        return <Users className='h-3 w-3 text-gray-600' />;
    }
  };

  const handleInviteMember = (): void => {
    if (!inviteEmail.trim()) return;

    // In a real implementation, this would send an email invitation
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteForm(false);
  };

  const TabButton: React.FC<{
    tab: typeof activeTab;
    icon: React.ReactNode;
    label: string;
    count?: number;
  }> = ({ tab, icon, label, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
        activeTab === tab
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className='ml-1 px-1.5 py-0.5 text-xs bg-secondary rounded-full'>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className='space-y-6'>
      {/* Workspace Header */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center'>
                <Folder className='mr-2 h-6 w-6' />
                {workspace.name}
              </CardTitle>
              <p className='text-muted-foreground mt-1'>
                {workspace.description}
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='flex items-center space-x-1'>
                <Users className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  {workspace.members.length} members
                </span>
              </div>
              {canManage && (
                <Button size='sm' variant='outline'>
                  <Settings className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className='flex space-x-1 bg-secondary/50 p-1 rounded-lg'>
        <TabButton
          tab='overview'
          icon={<FileText className='h-4 w-4' />}
          label='Overview'
        />
        <TabButton
          tab='members'
          icon={<Users className='h-4 w-4' />}
          label='Members'
          count={workspace.members.length}
        />
        <TabButton
          tab='templates'
          icon={<Star className='h-4 w-4' />}
          label='Shared Templates'
          count={sharedTemplates.length}
        />
        <TabButton
          tab='settings'
          icon={<Settings className='h-4 w-4' />}
          label='Settings'
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Projects
                  </span>
                  <span className='text-sm font-medium'>
                    {workspace.projects.length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Templates
                  </span>
                  <span className='text-sm font-medium'>
                    {sharedTemplates.length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    GitHub Repos
                  </span>
                  <span className='text-sm font-medium'>
                    {workspace.github_integrations.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-xs text-muted-foreground'>
                    Jane updated TypeScript template
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <span className='text-xs text-muted-foreground'>
                    Mike generated AGENTS.md for project
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                  <span className='text-xs text-muted-foreground'>
                    John connected new GitHub repo
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button size='sm' className='w-full justify-start'>
                <Plus className='mr-2 h-3 w-3' />
                Create Project
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='w-full justify-start'
              >
                <FileText className='mr-2 h-3 w-3' />
                New Template
              </Button>
              <Button
                size='sm'
                variant='outline'
                className='w-full justify-start'
              >
                <Github className='mr-2 h-3 w-3' />
                Connect GitHub
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'members' && (
        <div className='space-y-4'>
          {/* Invite Section */}
          {canManage && (
            <Card>
              <CardContent className='pt-6'>
                {showInviteForm ? (
                  <div className='flex space-x-2'>
                    <div className='flex-1'>
                      <Input
                        type='email'
                        placeholder='Enter email address'
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleInviteMember}>Invite</Button>
                    <Button
                      variant='outline'
                      onClick={() => setShowInviteForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowInviteForm(true)}>
                    <UserPlus className='mr-2 h-4 w-4' />
                    Invite Member
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({workspace.members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {workspace.members.map(member => (
                  <div
                    key={member.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex items-center space-x-3'>
                      <img
                        src={member.avatar || '/api/placeholder/32/32'}
                        alt={member.name}
                        className='w-8 h-8 rounded-full'
                      />
                      <div>
                        <div className='flex items-center space-x-2'>
                          <p className='font-medium text-sm'>{member.name}</p>
                          {getRoleIcon(member.role)}
                          <span className='text-xs text-muted-foreground capitalize'>
                            {member.role}
                          </span>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {member.email}
                        </p>
                      </div>
                    </div>
                    {canManage && member.id !== user?.id && (
                      <Button variant='ghost' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>
                  Shared Templates ({sharedTemplates.length})
                </CardTitle>
                {workspace.permissions.manage_templates && (
                  <Button size='sm'>
                    <Plus className='mr-2 h-3 w-3' />
                    Create Template
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2'>
                {sharedTemplates.map(template => (
                  <div key={template.id} className='p-4 border rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-medium text-sm'>{template.name}</h3>
                      <Button variant='ghost' size='sm'>
                        <Edit3 className='h-3 w-3' />
                      </Button>
                    </div>
                    <p className='text-xs text-muted-foreground mb-3'>
                      {template.category
                        .replace('-', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <div className='flex items-center space-x-1'>
                        <Clock className='h-3 w-3' />
                        <span>Used {template.usage.totalUses} times</span>
                      </div>
                      <span>
                        {Math.round(template.usage.successRate * 100)}% success
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='workspace-name'>Workspace Name</Label>
                <Input id='workspace-name' value={workspace.name} readOnly />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='workspace-description'>Description</Label>
                <Input
                  id='workspace-description'
                  value={workspace.description}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Create Projects</span>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        workspace.permissions.create_projects
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <span className='text-xs text-muted-foreground'>
                      {workspace.permissions.create_projects
                        ? 'Enabled'
                        : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Manage Templates</span>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        workspace.permissions.manage_templates
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <span className='text-xs text-muted-foreground'>
                      {workspace.permissions.manage_templates
                        ? 'Enabled'
                        : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Invite Members</span>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        workspace.permissions.invite_members
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <span className='text-xs text-muted-foreground'>
                      {workspace.permissions.invite_members
                        ? 'Enabled'
                        : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Configure GitHub</span>
                  <div className='flex items-center space-x-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        workspace.permissions.configure_github
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    <span className='text-xs text-muted-foreground'>
                      {workspace.permissions.configure_github
                        ? 'Enabled'
                        : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
