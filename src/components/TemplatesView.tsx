import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Star,
  FileText,
  Settings,
  File,
  Calendar,
  MoreHorizontal,
  Download,
  Edit3,
  Trash2,
  Copy,
  Crown,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';
import type { Template } from '@/types';

export const TemplatesView: React.FC = () => {
  const { currentProject, setCurrentView, addSelectedTemplate } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Default templates with proper initialization
  const templates: Template[] = [
    {
      id: 'claude-standard',
      name: 'Standard CLAUDE.md',
      category: 'agents-md',
      framework: 'any',
      language: 'any',
      content: {
        sections: [
          {
            id: 'overview',
            title: 'Project Overview',
            content: 'AI-powered documentation generator platform',
            order: 0,
            required: true,
          },
          {
            id: 'tech-stack',
            title: 'Technical Stack',
            content:
              'Built with React 19, TypeScript, and modern web technologies',
            order: 1,
            required: true,
          },
        ],
        metadata: {
          version: '2.0',
          lastUpdated: new Date(),
          compatibility: ['claude-3-5-sonnet', 'claude-3-opus'],
        },
      },
      variables: [
        {
          id: 'techStack',
          name: 'techStack',
          type: 'array',
          description: 'Technologies used in the project',
          defaultValue: ['React', 'TypeScript'],
          required: true,
        },
        {
          id: 'framework',
          name: 'framework',
          type: 'string',
          description: 'Primary framework',
          defaultValue: 'React',
          required: false,
        },
      ],
      usage: {
        totalUses: 156,
        lastUsed: new Date(Date.now() - 86400000),
        successRate: 0.97,
        avgGenerationTime: 15000,
      },
      isCustom: false,
      createdBy: 'system',
    },
    {
      id: 'cursor-typescript',
      name: 'TypeScript .cursorrules',
      category: 'cursor-rules',
      framework: 'typescript',
      language: 'typescript',
      content: {
        sections: [
          {
            title: 'TypeScript Configuration',
            content: 'Strict TypeScript settings for optimal development',
            variables: ['strictMode', 'targetVersion'],
          },
          {
            title: 'Code Standards',
            content: 'ESLint and Prettier configuration for consistent code',
            variables: [],
          },
        ],
        metadata: {
          version: '1.5',
          lastUpdated: new Date(Date.now() - 172800000),
          compatibility: ['typescript-5.0+'],
        },
      },
      variables: [
        {
          id: 'strictMode',
          name: 'strictMode',
          type: 'boolean',
          description: 'Enable strict TypeScript mode',
          defaultValue: 'true',
          required: true,
        },
        {
          id: 'targetVersion',
          name: 'targetVersion',
          type: 'string',
          description: 'Target TypeScript version',
          defaultValue: '5.0',
          required: false,
        },
      ],
      usage: {
        totalUses: 89,
        lastUsed: new Date(Date.now() - 43200000),
        successRate: 0.94,
        avgGenerationTime: 12000,
      },
      isCustom: false,
      createdBy: 'system',
    },
    {
      id: 'react-agents',
      name: 'React AGENTS.md',
      category: 'agents-md',
      framework: 'react',
      language: 'typescript',
      content: {
        sections: [
          {
            id: 'react-guidelines',
            title: 'React Project Guidelines',
            content: 'Component-based development guidelines',
            order: 0,
            required: true,
          },
        ],
        metadata: {
          version: '1.0',
          lastUpdated: new Date(Date.now() - 259200000),
          compatibility: ['react-18+', 'react-19'],
        },
      },
      variables: [
        {
          id: 'componentLibrary',
          name: 'componentLibrary',
          type: 'string',
          description: 'UI component library',
          defaultValue: 'shadcn/ui',
          required: false,
        },
        {
          id: 'stateManagement',
          name: 'stateManagement',
          type: 'string',
          description: 'State management solution',
          defaultValue: 'zustand',
          required: false,
        },
      ],
      usage: {
        totalUses: 34,
        lastUsed: new Date(Date.now() - 86400000),
        successRate: 0.91,
        avgGenerationTime: 18000,
      },
      isCustom: true,
      createdBy: currentProject?.id || 'user',
    },
  ];

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    {
      value: 'agents-md',
      label: 'CLAUDE.md',
      count: templates.filter(t => t.category === 'agents-md').length,
    },
    {
      value: 'cursor-rules',
      label: '.cursorrules',
      count: templates.filter(t => t.category === 'cursor-rules').length,
    },
    {
      value: 'custom',
      label: 'Custom',
      count: templates.filter(t => t.isCustom).length,
    },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.language.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'custom'
        ? template.isCustom
        : template.category === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = (): void => {
    // Navigate to template builder with empty template
    setCurrentView('generate');
  };

  const handleUseTemplate = (template: Template): void => {
    // Add template to selected templates and navigate to generate view
    addSelectedTemplate(template.id);
    setCurrentView('generate');
  };

  const handleEditTemplate = (template: Template): void => {
    // Navigate to template builder with selected template
    addSelectedTemplate(template.id);
    setCurrentView('generate');
  };

  const handleDeleteTemplate = (template: Template): void => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      // In a real app, this would delete from the backend
      console.log(`Deleting template: ${template.id}`);
    }
  };

  const handleDuplicateTemplate = (template: Template): void => {
    // In a real app, this would duplicate the template in the backend
    console.log(`Duplicating template: ${template.id}`);
    // Navigate to template builder with duplicated template
    addSelectedTemplate(template.id);
    setCurrentView('generate');
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <FileText className='mr-3 h-8 w-8 text-primary' />
            Templates
          </h1>
          <p className='text-muted-foreground'>
            Pre-built templates for generating documentation and configuration
            files
          </p>
        </div>

        <Button onClick={handleCreateTemplate}>
          <Plus className='mr-2 h-4 w-4' />
          New Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search templates...'
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

      {/* Categories */}
      <div className='flex space-x-2 overflow-x-auto pb-2'>
        {categories.map(category => (
          <Button
            key={category.value}
            variant={
              selectedCategory === category.value ? 'default' : 'outline'
            }
            size='sm'
            onClick={() => setSelectedCategory(category.value)}
            className='whitespace-nowrap'
          >
            {category.label}
            <span className='ml-2 px-1.5 py-0.5 text-xs bg-secondary rounded-full'>
              {category.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredTemplates.map(template => (
          <Card key={template.id} className='hover:shadow-md transition-shadow'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-2'>
                    <CardTitle className='text-lg'>{template.name}</CardTitle>
                    {template.isCustom && (
                      <Crown className='h-4 w-4 text-yellow-600' />
                    )}
                  </div>
                  <div className='flex items-center space-x-2 mt-1'>
                    <span className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded'>
                      {template.category
                        .replace('-', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {template.framework} / {template.language}
                    </span>
                  </div>
                </div>
                <div className='relative'>
                  <Button variant='ghost' size='sm'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className='pt-0'>
              <div className='space-y-4'>
                {/* Usage Stats */}
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div className='flex items-center text-muted-foreground'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    {template.usage.totalUses} uses
                  </div>
                  <div className='flex items-center text-muted-foreground'>
                    <Star className='mr-1 h-3 w-3' />
                    {Math.round(template.usage.successRate * 100)}% success
                  </div>
                  <div className='flex items-center text-muted-foreground'>
                    <Clock className='mr-1 h-3 w-3' />
                    {Math.round(template.usage.avgGenerationTime / 1000)}s avg
                  </div>
                  <div className='flex items-center text-muted-foreground'>
                    <Calendar className='mr-1 h-3 w-3' />
                    {template.usage.lastUsed.toLocaleDateString()}
                  </div>
                </div>

                {/* Variables Preview */}
                {template.variables.length > 0 && (
                  <div>
                    <p className='text-xs text-muted-foreground mb-1'>
                      Variables ({template.variables.length})
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {template.variables.slice(0, 3).map(variable => (
                        <span
                          key={variable.name}
                          className='text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded'
                        >
                          {variable.name}
                        </span>
                      ))}
                      {template.variables.length > 3 && (
                        <span className='text-xs text-muted-foreground'>
                          +{template.variables.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className='flex space-x-2'>
                  <Button
                    size='sm'
                    onClick={() => handleUseTemplate(template)}
                    className='flex-1'
                  >
                    <Download className='mr-1 h-3 w-3' />
                    Use
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit3 className='h-3 w-3' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                  {template.isCustom && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteTemplate(template)}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className='col-span-full'>
            <Card className='p-8 text-center border-dashed'>
              <FileText className='mx-auto h-12 w-12 text-muted-foreground/50 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No templates found</h3>
              <p className='text-muted-foreground mb-4'>
                {searchQuery
                  ? 'No templates match your search criteria.'
                  : 'Create your first template to get started.'}
              </p>
              <Button onClick={handleCreateTemplate}>
                <Plus className='mr-2 h-4 w-4' />
                Create Template
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Template Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Template Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>
                {templates.length}
              </div>
              <p className='text-sm text-muted-foreground'>Total Templates</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {templates.filter(t => t.isCustom).length}
              </div>
              <p className='text-sm text-muted-foreground'>Custom Templates</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {templates.reduce((sum, t) => sum + t.usage.totalUses, 0)}
              </div>
              <p className='text-sm text-muted-foreground'>Total Uses</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {Math.round(
                  (templates.reduce((sum, t) => sum + t.usage.successRate, 0) /
                    templates.length) *
                    100
                )}
                %
              </div>
              <p className='text-sm text-muted-foreground'>Avg Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
