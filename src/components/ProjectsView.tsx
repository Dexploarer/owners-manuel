import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  Calendar,
  Users,
  MoreHorizontal,
  Star,
  Github,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';
import type { Project } from '@/types';

export const ProjectsView: React.FC = () => {
  const { projects, currentProject, setCurrentProject, addProject } =
    useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProject = (): void => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: 'New Project',
      description: 'Project description',
      techStack: [],
      team: [],
      templates: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addProject(newProject);
    setCurrentProject(newProject);
  };

  const filteredProjects = projects.filter(
    project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <FolderOpen className='mr-3 h-8 w-8 text-primary' />
            Projects
          </h1>
          <p className='text-muted-foreground'>
            Manage your documentation projects and their configurations
          </p>
        </div>

        <Button onClick={handleCreateProject}>
          <Plus className='mr-2 h-4 w-4' />
          New Project
        </Button>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search projects...'
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

      {/* Current Project */}
      {currentProject && (
        <Card className='bg-primary/5 border-primary/20'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <Star className='h-5 w-5 text-primary' fill='currentColor' />
                <CardTitle>Current Project</CardTitle>
              </div>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div>
                <h3 className='font-semibold text-lg'>{currentProject.name}</h3>
                <p className='text-muted-foreground'>
                  {currentProject.description}
                </p>
              </div>

              <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                <div className='flex items-center'>
                  <Users className='mr-1 h-4 w-4' />
                  {currentProject.team.length} members
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h-4 w-4' />
                  Created {currentProject.createdAt.toLocaleDateString()}
                </div>
              </div>

              {currentProject.techStack.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {currentProject.techStack.map(tech => (
                    <span
                      key={tech.id}
                      className='px-2 py-1 text-xs bg-primary/10 text-primary rounded-full'
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProjects.map(project => (
          <Card
            key={project.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              currentProject?.id === project.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setCurrentProject(project)}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg'>{project.name}</CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {project.description}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={e => e.stopPropagation()}
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>

            <CardContent className='pt-0'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <div className='flex items-center text-muted-foreground'>
                    <Users className='mr-1 h-4 w-4' />
                    {project.team.length} members
                  </div>
                  <div className='flex items-center text-muted-foreground'>
                    <FolderOpen className='mr-1 h-4 w-4' />
                    {project.documents.length} docs
                  </div>
                </div>

                {project.techStack.length > 0 && (
                  <div className='flex flex-wrap gap-1'>
                    {project.techStack.slice(0, 3).map(tech => (
                      <span
                        key={tech.id}
                        className='px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded'
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
                )}

                <div className='flex items-center text-xs text-muted-foreground'>
                  <Calendar className='mr-1 h-3 w-3' />
                  Updated {project.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className='col-span-full'>
            <Card className='p-8 text-center border-dashed'>
              <FolderOpen className='mx-auto h-12 w-12 text-muted-foreground/50 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No projects found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery
                  ? 'No projects match your search criteria.'
                  : 'Create your first project to get started.'}
              </p>
              <Button onClick={handleCreateProject}>
                <Plus className='mr-2 h-4 w-4' />
                Create Project
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
