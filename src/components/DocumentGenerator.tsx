import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Settings,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MCPStatus } from './MCPStatus';
import { useAppStore, useSelectedTemplatesData } from '@/store';
import { claudeService } from '@/services/claude';
import type { GenerationRequest, Template } from '@/types';

const defaultTemplates: Template[] = [
  {
    id: 'agents-md',
    name: 'AGENTS.md',
    category: 'agents-md',
    framework: 'any',
    language: 'any',
    content: {
      sections: [],
      metadata: { version: '1.0', lastUpdated: new Date(), compatibility: [] },
    },
    variables: [],
    usage: {
      totalUses: 0,
      lastUsed: new Date(),
      successRate: 0.95,
      avgGenerationTime: 30000,
    },
    isCustom: false,
  },
  {
    id: 'cursor-rules',
    name: '.cursorrules',
    category: 'cursor-rules',
    framework: 'any',
    language: 'any',
    content: {
      sections: [],
      metadata: { version: '1.0', lastUpdated: new Date(), compatibility: [] },
    },
    variables: [],
    usage: {
      totalUses: 0,
      lastUsed: new Date(),
      successRate: 0.92,
      avgGenerationTime: 25000,
    },
    isCustom: false,
  },
  {
    id: 'workflow',
    name: 'Development Workflow',
    category: 'workflow',
    framework: 'any',
    language: 'any',
    content: {
      sections: [],
      metadata: { version: '1.0', lastUpdated: new Date(), compatibility: [] },
    },
    variables: [],
    usage: {
      totalUses: 0,
      lastUsed: new Date(),
      successRate: 0.88,
      avgGenerationTime: 35000,
    },
    isCustom: false,
  },
];

export const DocumentGenerator: React.FC = () => {
  const {
    currentProject,
    selectedTemplates,
    addSelectedTemplate,
    removeSelectedTemplate,
    isGenerating,
    generationProgress,
    generationError,
    setGenerating,
    setGenerationProgress,
    setGenerationError,
    addDocument,
  } = useAppStore();

  const [projectDescription, setProjectDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [options, setOptions] = useState<{
    includeComments: boolean;
    detailLevel: 'basic' | 'detailed' | 'comprehensive';
    outputFormat: 'markdown' | 'json' | 'yaml';
  }>({
    includeComments: true,
    detailLevel: 'detailed',
    outputFormat: 'markdown',
  });

  const selectedTemplatesData = useSelectedTemplatesData();
  const availableTemplates = defaultTemplates; // In a real app, this would come from the store

  const handleTemplateToggle = (templateId: string): void => {
    if (selectedTemplates.includes(templateId)) {
      removeSelectedTemplate(templateId);
    } else {
      addSelectedTemplate(templateId);
    }
  };

  const handleGenerate = async (): Promise<void> => {
    if (!currentProject) {
      setGenerationError('Please select a project first');
      return;
    }

    if (selectedTemplates.length === 0) {
      setGenerationError('Please select at least one template');
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setGenerationProgress(0);

    try {
      const request: GenerationRequest = {
        projectId: currentProject.id,
        templateIds: selectedTemplates,
        customPrompt: customPrompt || projectDescription,
        variables: {
          projectName: currentProject.name,
          projectDescription: currentProject.description,
          techStack: currentProject.techStack,
        },
        options,
      };

      // Simulate progress updates
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 10, 90);
        setGenerationProgress(currentProgress);
      }, 500);

      const result = await claudeService.generateDocuments(request);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (result.metadata.success) {
        result.documents.forEach(doc => addDocument(doc));
        setTimeout(() => {
          setGenerating(false);
          setGenerationProgress(0);
        }, 1000);
      } else {
        setGenerationError(result.metadata.errors?.[0] || 'Generation failed');
        setGenerating(false);
        setGenerationProgress(0);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setGenerationError(errorMessage);
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <Sparkles className='mr-3 h-8 w-8 text-primary' />
            Generate Documentation
          </h1>
          <p className='text-muted-foreground'>
            Create comprehensive AI agent documentation for your project
          </p>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Configuration Panel */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {currentProject ? (
                <div className='p-4 border rounded-lg bg-secondary/50'>
                  <h3 className='font-medium'>{currentProject.name}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {currentProject.description}
                  </p>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {currentProject.techStack.map(tech => (
                      <span
                        key={tech.id}
                        className='px-2 py-1 text-xs bg-background rounded-full'
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='p-8 text-center text-muted-foreground border rounded-lg border-dashed'>
                  <FileText className='mx-auto h-12 w-12 mb-4 opacity-50' />
                  <p>No project selected</p>
                  <p className='text-sm'>
                    Please create or select a project first
                  </p>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='description'>
                  Project Description (Optional)
                </Label>
                <textarea
                  id='description'
                  className='w-full p-3 border rounded-lg resize-none min-h-[80px]'
                  placeholder='Provide additional context about your project...'
                  value={projectDescription}
                  onChange={e => setProjectDescription(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='prompt'>Custom Instructions (Optional)</Label>
                <textarea
                  id='prompt'
                  className='w-full p-3 border rounded-lg resize-none min-h-[100px]'
                  placeholder='Any specific requirements or instructions for the AI...'
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-2'>
                {availableTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplates.includes(template.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleTemplateToggle(template.id)}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <h3 className='font-medium'>{template.name}</h3>
                      {selectedTemplates.includes(template.id) && (
                        <CheckCircle className='h-5 w-5 text-primary' />
                      )}
                    </div>
                    <p className='text-sm text-muted-foreground mb-2'>
                      {template.category
                        .replace('-', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                      <span>
                        Success Rate:{' '}
                        {Math.round(template.usage.successRate * 100)}%
                      </span>
                      <span>
                        ~{Math.round(template.usage.avgGenerationTime / 1000)}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generation Options */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Settings className='mr-2 h-5 w-5' />
                Options
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='comments'
                  checked={options.includeComments}
                  onChange={e =>
                    setOptions(prev => ({
                      ...prev,
                      includeComments: e.target.checked,
                    }))
                  }
                  className='rounded'
                />
                <Label htmlFor='comments'>Include detailed comments</Label>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='detail'>Detail Level</Label>
                <select
                  id='detail'
                  value={options.detailLevel}
                  onChange={e =>
                    setOptions(prev => ({
                      ...prev,
                      detailLevel: e.target.value as
                        | 'basic'
                        | 'detailed'
                        | 'comprehensive',
                    }))
                  }
                  className='w-full p-2 border rounded-lg'
                >
                  <option value='basic'>Basic</option>
                  <option value='detailed'>Detailed</option>
                  <option value='comprehensive'>Comprehensive</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='format'>Output Format</Label>
                <select
                  id='format'
                  value={options.outputFormat}
                  onChange={e =>
                    setOptions(prev => ({
                      ...prev,
                      outputFormat: e.target.value as
                        | 'markdown'
                        | 'json'
                        | 'yaml',
                    }))
                  }
                  className='w-full p-2 border rounded-lg'
                >
                  <option value='markdown'>Markdown</option>
                  <option value='json'>JSON</option>
                  <option value='yaml'>YAML</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Panel */}
        <div className='space-y-6'>
          {/* MCP Status */}
          <MCPStatus />

          {/* Generation Status */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Status</CardTitle>
            </CardHeader>
            <CardContent>
              {!isGenerating && !generationError && (
                <div className='text-center py-8 text-muted-foreground'>
                  <Sparkles className='mx-auto h-12 w-12 mb-4 opacity-50' />
                  <p>Ready to generate</p>
                  <p className='text-sm'>
                    Configure your settings and click generate
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className='text-center py-8'>
                  <Loader2 className='mx-auto h-12 w-12 mb-4 animate-spin text-primary' />
                  <p className='font-medium mb-2'>
                    Generating documentation...
                  </p>
                  <div className='w-full bg-secondary rounded-full h-2 mb-2'>
                    <div
                      className='bg-primary h-2 rounded-full transition-all duration-300'
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {generationProgress}% complete
                  </p>
                </div>
              )}

              {generationError && (
                <div className='text-center py-8'>
                  <AlertCircle className='mx-auto h-12 w-12 mb-4 text-destructive' />
                  <p className='font-medium text-destructive mb-2'>
                    Generation Failed
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {generationError}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className='pt-6'>
              <Button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !currentProject ||
                  selectedTemplates.length === 0
                }
                className='w-full h-12'
                size='lg'
              >
                {isGenerating ? (
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                ) : (
                  <Play className='mr-2 h-5 w-5' />
                )}
                Generate Documentation
              </Button>

              {selectedTemplates.length > 0 && (
                <p className='text-center text-sm text-muted-foreground mt-2'>
                  {selectedTemplates.length} template
                  {selectedTemplates.length > 1 ? 's' : ''} selected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Selected Templates Summary */}
          {selectedTemplatesData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {selectedTemplatesData.map(template => (
                    <div
                      key={template.id}
                      className='flex items-center justify-between p-2 bg-secondary/50 rounded'
                    >
                      <span className='text-sm font-medium'>
                        {template.name}
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeSelectedTemplate(template.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
