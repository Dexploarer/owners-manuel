import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  MoreHorizontal,
  Download,
  Edit3,
  Trash2,
  Share2,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store';
import type { Document } from '@/types';

export const DocumentsView: React.FC = () => {
  const { currentProject } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>(
    'updated'
  );

  // Default documents with proper initialization
  const documents: Document[] = [
    {
      id: 'readme-main',
      projectId: currentProject?.id || 'default-project',
      title: 'Project README',
      content:
        '# AI Documentation Platform\n\nA comprehensive platform for generating AI-powered documentation using Claude and modern web technologies.\n\n## Features\n- Document generation\n- Template management\n- GitHub integration\n- Team collaboration',
      type: 'README',
      version: 2,
      generatedBy: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        version: '2024-10-22',
        parameters: {
          temperature: 0.7,
          maxTokens: 4000,
          topP: 0.9,
        },
      },
      performance: {
        generationTime: 15000,
        tokenUsage: {
          input: 50,
          output: 95,
          total: 145,
        },
        qualityScore: 0.95,
        userSatisfaction: 4.8,
      },
      feedback: [],
      status: 'published',
      createdAt: new Date(Date.now() - 604800000),
      updatedAt: new Date(Date.now() - 3600000),
    },
    {
      id: 'api-docs',
      projectId: currentProject?.id || 'default-project',
      title: 'API Documentation',
      content:
        '# API Reference\n\n## Authentication\nAll API requests require authentication using an API key.\n\n## Endpoints\n\n### Generate Document\n`POST /api/generate`\n\nGenerates a new document based on provided template and variables.',
      type: 'WORKFLOW',
      version: 1,
      generatedBy: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        version: '2024-10-22',
        parameters: {
          temperature: 0.7,
          maxTokens: 4000,
          topP: 0.9,
        },
      },
      performance: {
        generationTime: 12000,
        tokenUsage: {
          input: 30,
          output: 59,
          total: 89,
        },
        qualityScore: 0.92,
        userSatisfaction: 4.5,
      },
      feedback: [],
      status: 'draft',
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 7200000),
    },
    {
      id: 'setup-guide',
      projectId: currentProject?.id || 'default-project',
      title: 'Development Setup Guide',
      content:
        '# Development Setup\n\n## Prerequisites\n- Bun runtime\n- Node.js 18+\n- Git\n\n## Installation\n1. Clone the repository\n2. Install dependencies: `bun install`\n3. Set up environment variables\n4. Start development server: `bun dev`',
      type: 'WORKFLOW',
      version: 1,
      generatedBy: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        version: '2024-10-22',
        parameters: {
          temperature: 0.7,
          maxTokens: 4000,
          topP: 0.9,
        },
      },
      performance: {
        generationTime: 18000,
        tokenUsage: {
          input: 80,
          output: 154,
          total: 234,
        },
        qualityScore: 0.91,
        userSatisfaction: 4.7,
      },
      feedback: [],
      status: 'published',
      createdAt: new Date(Date.now() - 432000000),
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      id: 'architecture-spec',
      projectId: currentProject?.id || 'default-project',
      title: 'System Architecture Specification',
      content:
        '# System Architecture\n\n## Overview\nThe platform follows a modular architecture with clear separation of concerns.\n\n## Components\n- Frontend: React 19 with TypeScript\n- State Management: Zustand\n- API Layer: Claude SDK integration\n- Authentication: Auth0',
      type: 'SECURITY',
      version: 2,
      generatedBy: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        version: '2024-10-22',
        parameters: {
          temperature: 0.7,
          maxTokens: 4000,
          topP: 0.9,
        },
      },
      performance: {
        generationTime: 25000,
        tokenUsage: {
          input: 120,
          output: 192,
          total: 312,
        },
        qualityScore: 0.93,
        userSatisfaction: 4.6,
      },
      feedback: [],
      status: 'review',
      createdAt: new Date(Date.now() - 518400000),
      updatedAt: new Date(Date.now() - 172800000),
    },
    {
      id: 'troubleshooting',
      projectId: currentProject?.id || 'default-project',
      title: 'Common Issues & Troubleshooting',
      content:
        '# Troubleshooting Guide\n\n## Common Issues\n\n### Build Errors\n- Check TypeScript configuration\n- Verify all dependencies are installed\n\n### Authentication Issues\n- Verify API keys are set correctly\n- Check CORS configuration',
      type: 'TESTING',
      version: 1,
      generatedBy: {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        version: '2024-10-22',
        parameters: {
          temperature: 0.7,
          maxTokens: 4000,
          topP: 0.9,
        },
      },
      performance: {
        generationTime: 20000,
        tokenUsage: {
          input: 60,
          output: 118,
          total: 178,
        },
        qualityScore: 0.89,
        userSatisfaction: 4.4,
      },
      feedback: [],
      status: 'published',
      createdAt: new Date(Date.now() - 345600000),
      updatedAt: new Date(Date.now() - 43200000),
    },
  ];

  const categories = [
    { value: 'all', label: 'All Documents', count: documents.length },
    {
      value: 'README',
      label: 'README',
      count: documents.filter(d => d.type === 'README').length,
    },
    {
      value: 'AGENTS_MD',
      label: 'AGENTS.md',
      count: documents.filter(d => d.type === 'AGENTS_MD').length,
    },
    {
      value: 'CURSOR_RULES',
      label: '.cursorrules',
      count: documents.filter(d => d.type === 'CURSOR_RULES').length,
    },
    {
      value: 'WORKFLOW',
      label: 'Workflow',
      count: documents.filter(d => d.type === 'WORKFLOW').length,
    },
    {
      value: 'TESTING',
      label: 'Testing',
      count: documents.filter(d => d.type === 'TESTING').length,
    },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: Circle, color: 'text-gray-500' },
    {
      value: 'review',
      label: 'Review',
      icon: AlertCircle,
      color: 'text-yellow-500',
    },
    {
      value: 'published',
      label: 'Published',
      icon: CheckCircle,
      color: 'text-green-500',
    },
  ];

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.generatedBy.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || doc.type === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'updated':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  const handleCreateDocument = (): void => {
    // In a real implementation, this would open a document creation modal
    alert('Document creation functionality will be implemented');
  };

  const handleEditDocument = (document: Document): void => {
    // In a real implementation, this would open the document editor
    alert(`Editing document: ${document.title}`);
  };

  const handleDeleteDocument = (document: Document): void => {
    if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
      // In a real implementation, this would make an API call to delete the document
      alert(`Document "${document.title}" would be deleted`);
    }
  };

  const handleShareDocument = (document: Document): void => {
    // In a real implementation, this would open a sharing modal
    navigator.clipboard.writeText(`Shared document: ${document.title}`);
    alert('Document link copied to clipboard');
  };

  const handleDownloadDocument = (doc: Document): void => {
    // In a real implementation, this would trigger a file download
    const blob = new Blob([doc.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    if (!statusOption) return Circle;
    return statusOption.icon;
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'text-gray-500';
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <BookOpen className='mr-3 h-8 w-8 text-primary' />
            Documents
          </h1>
          <p className='text-muted-foreground'>
            Generated documentation and project files
          </p>
        </div>

        <Button onClick={handleCreateDocument}>
          <Plus className='mr-2 h-4 w-4' />
          New Document
        </Button>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center space-x-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search documents...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className='px-3 py-2 border rounded-md'
        >
          <option value='updated'>Sort by Updated</option>
          <option value='created'>Sort by Created</option>
          <option value='name'>Sort by Name</option>
        </select>

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

      {/* Documents List */}
      <div className='space-y-4'>
        {filteredAndSortedDocuments.map(document => {
          const StatusIcon = getStatusIcon(document.status);
          return (
            <Card
              key={document.id}
              className='hover:shadow-md transition-shadow'
            >
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3 mb-2'>
                      <h3 className='text-lg font-semibold'>
                        {document.title}
                      </h3>
                      <span className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded'>
                        {document.type}
                      </span>
                      <div className='flex items-center space-x-1'>
                        <StatusIcon
                          className={`h-4 w-4 ${getStatusColor(document.status)}`}
                        />
                        <span
                          className={`text-sm capitalize ${getStatusColor(document.status)}`}
                        >
                          {document.status}
                        </span>
                      </div>
                    </div>

                    <p className='text-muted-foreground text-sm mb-3 line-clamp-2'>
                      {document.content
                        .split('\n')
                        .find(line => line.trim() && !line.startsWith('#')) ||
                        document.content.split('\n')[0]}
                    </p>

                    <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                      <div className='flex items-center'>
                        <FileText className='mr-1 h-3 w-3' />
                        {document.performance.tokenUsage.total} tokens
                      </div>
                      <div className='flex items-center'>
                        <Clock className='mr-1 h-3 w-3' />
                        {Math.round(document.performance.generationTime / 1000)}
                        s gen
                      </div>
                      <div className='flex items-center'>
                        <Calendar className='mr-1 h-3 w-3' />
                        Updated {document.updatedAt.toLocaleDateString()}
                      </div>
                      <div className='flex items-center'>
                        <TrendingUp className='mr-1 h-3 w-3' />v
                        {document.version}
                      </div>
                    </div>

                    <div className='flex flex-wrap gap-1 mt-3'>
                      <span className='text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded'>
                        {document.generatedBy.model}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2 ml-4'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDownloadDocument(document)}
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleShareDocument(document)}
                    >
                      <Share2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEditDocument(document)}
                    >
                      <Edit3 className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {filteredAndSortedDocuments.length === 0 && (
          <Card className='p-8 text-center border-dashed'>
            <BookOpen className='mx-auto h-12 w-12 text-muted-foreground/50 mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No documents found</h3>
            <p className='text-muted-foreground mb-4'>
              {searchQuery
                ? 'No documents match your search criteria.'
                : 'Create your first document to get started.'}
            </p>
            <Button onClick={handleCreateDocument}>
              <Plus className='mr-2 h-4 w-4' />
              Create Document
            </Button>
          </Card>
        )}
      </div>

      {/* Document Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Document Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>
                {documents.length}
              </div>
              <p className='text-sm text-muted-foreground'>Total Documents</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {documents.filter(d => d.status === 'published').length}
              </div>
              <p className='text-sm text-muted-foreground'>Published</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {documents
                  .reduce((sum, d) => sum + d.performance.tokenUsage.total, 0)
                  .toLocaleString()}
              </div>
              <p className='text-sm text-muted-foreground'>Total Tokens</p>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {Math.round(
                  documents.reduce((sum, d) => sum + d.performance.qualityScore, 0) /
                  documents.length * 100
                )}%
              </div>
              <p className='text-sm text-muted-foreground'>Avg Quality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
