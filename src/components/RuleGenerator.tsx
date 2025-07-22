import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Settings,
  Sparkles,
  Check,
  Loader2,
  AlertCircle,
  Code,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store';
import { mcpClaudeClient } from '@/services/mcpClaudeClient';
import type { GenerationRequest, ClaudeRuleTemplate } from '@/types';

interface RuleGeneratorProps {
  repositoryName?: string;
  repositoryDescription?: string;
  techStack?: { name: string; version?: string }[];
}

const defaultTemplates: ClaudeRuleTemplate[] = [
  {
    id: 'claude-md-comprehensive',
    name: 'Comprehensive CLAUDE.md',
    description: 'Complete AI agent configuration with all best practices',
    file_type: 'CLAUDE.md',
    content_template: '',
    variables: [],
    applicable_tech_stacks: ['any'],
    usage_count: 0,
    created_by: 'system',
    is_public: true,
    tags: ['comprehensive', 'best-practices'],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'cursorrules-typescript',
    name: 'TypeScript .cursorrules',
    description: 'Optimized Cursor rules for TypeScript projects',
    file_type: '.cursorrules',
    content_template: '',
    variables: [],
    applicable_tech_stacks: ['typescript', 'javascript', 'react', 'nextjs'],
    usage_count: 0,
    created_by: 'system',
    is_public: true,
    tags: ['typescript', 'cursor', 'javascript'],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'agents-md-react',
    name: 'React AGENTS.md',
    description: 'Specialized agent documentation for React applications',
    file_type: 'AGENTS.md',
    content_template: '',
    variables: [],
    applicable_tech_stacks: ['react', 'nextjs', 'typescript'],
    usage_count: 0,
    created_by: 'system',
    is_public: true,
    tags: ['react', 'agents', 'documentation'],
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export const RuleGenerator: React.FC<RuleGeneratorProps> = ({
  repositoryName,
  repositoryDescription,
  techStack = [],
}) => {
  const { currentProject } = useAppStore();
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    'claude-md-comprehensive',
  ]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<Record<string, string>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [copiedFiles, setCopiedFiles] = useState<Set<string>>(new Set());

  const projectName = repositoryName || currentProject?.name || 'My Project';
  const projectDescription =
    repositoryDescription || currentProject?.description || '';
  const projectTechStack =
    techStack.length > 0 ? techStack : currentProject?.techStack || [];

  const handleTemplateToggle = (templateId: string): void => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleGenerate = async (): Promise<void> => {
    if (selectedTemplates.length === 0) {
      setError('Please select at least one template to generate');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedRules({});

    try {
      const request: GenerationRequest = {
        projectId: currentProject?.id || 'temp-project',
        templateIds: selectedTemplates,
        customPrompt: customInstructions,
        variables: {
          projectName,
          projectDescription,
          techStack: projectTechStack,
        },
        options: {
          includeComments: true,
          detailLevel: 'comprehensive',
          outputFormat: 'markdown',
        },
      };

      // Ensure MCP client is initialized
      if (!mcpClaudeClient.isConnected()) {
        await mcpClaudeClient.initialize();
      }

      const generatedContent: Record<string, string> = {};

      // Generate each template sequentially
      for (const templateId of selectedTemplates) {
        try {
          let content = '';
          
          if (templateId === 'claude-md-comprehensive' || templateId === 'agents-md-react') {
            content = await mcpClaudeClient.createAgentsMd({
              projectName,
              projectDescription,
              techStack: projectTechStack,
              customInstructions
            });
          } else if (templateId === 'cursorrules-typescript') {
            content = await mcpClaudeClient.createCursorRules({
              projectName,
              projectDescription,
              techStack: projectTechStack,
              customInstructions
            });
          } else {
            // For other templates, use the general document generation
            const result = await mcpClaudeClient.generateDocuments(request);
            content = result.documents[0]?.content || 'No content generated';
          }
          
          generatedContent[templateId] = content;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          generatedContent[templateId] = `Error: ${errorMessage}`;
        }
      }

      setGeneratedRules(generatedContent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async (
    templateId: string,
    content: string
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFiles(prev => new Set(prev).add(templateId));
      setTimeout(() => {
        setCopiedFiles(prev => {
          const next = new Set(prev);
          next.delete(templateId);
          return next;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = (templateId: string, content: string): void => {
    const template = defaultTemplates.find(t => t.id === templateId);
    const fileName = template?.file_type || `${templateId}.md`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTemplateIcon = (fileType: string): React.ReactNode => {
    switch (fileType) {
      case 'CLAUDE.md':
        return <Sparkles className='h-4 w-4' />;
      case '.cursorrules':
        return <Code className='h-4 w-4' />;
      case 'AGENTS.md':
        return <GitBranch className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <Label className='text-sm font-medium'>Project Name</Label>
              <p className='text-sm text-muted-foreground mt-1'>
                {projectName}
              </p>
            </div>
            <div>
              <Label className='text-sm font-medium'>Tech Stack</Label>
              <div className='flex flex-wrap gap-1 mt-1'>
                {projectTechStack.map((tech, index) => (
                  <span
                    key={index}
                    className='px-2 py-1 text-xs bg-secondary rounded-full'
                  >
                    {tech.name} {tech.version || ''}
                  </span>
                ))}
                {projectTechStack.length === 0 && (
                  <span className='text-sm text-muted-foreground'>
                    No tech stack specified
                  </span>
                )}
              </div>
            </div>
          </div>
          {projectDescription && (
            <div>
              <Label className='text-sm font-medium'>Description</Label>
              <p className='text-sm text-muted-foreground mt-1'>
                {projectDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Rule Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {defaultTemplates.map(template => (
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
                  <div className='flex items-center space-x-2'>
                    {getTemplateIcon(template.file_type)}
                    <h3 className='font-medium text-sm'>
                      {template.file_type}
                    </h3>
                  </div>
                  {selectedTemplates.includes(template.id) && (
                    <Check className='h-4 w-4 text-primary' />
                  )}
                </div>
                <p className='text-xs text-muted-foreground mb-2'>
                  {template.description}
                </p>
                <div className='flex flex-wrap gap-1'>
                  {template.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className='px-1.5 py-0.5 text-xs bg-secondary/60 rounded'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Settings className='mr-2 h-5 w-5' />
            Custom Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <Label htmlFor='custom-instructions'>
              Additional requirements or specific guidelines (optional)
            </Label>
            <Textarea
              id='custom-instructions'
              placeholder='e.g., Focus on TypeScript best practices, include specific testing patterns, emphasize security considerations...'
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              className='min-h-[100px]'
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className='pt-6'>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedTemplates.length === 0}
            className='w-full h-12'
            size='lg'
          >
            {isGenerating ? (
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            ) : (
              <Sparkles className='mr-2 h-5 w-5' />
            )}
            Generate Rule Files ({selectedTemplates.length})
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
              <AlertCircle className='h-4 w-4 text-destructive mr-2 flex-shrink-0' />
              <p className='text-sm text-destructive'>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Rules */}
      {Object.keys(generatedRules).length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Generated Rule Files</h3>
          {Object.entries(generatedRules).map(([templateId, content]) => {
            const template = defaultTemplates.find(t => t.id === templateId);
            const fileName = template?.file_type || `${templateId}.md`;
            const isCopied = copiedFiles.has(templateId);

            return (
              <Card key={templateId}>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      {getTemplateIcon(fileName)}
                      <span className='ml-2'>{fileName}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleCopyToClipboard(templateId, content)
                        }
                        disabled={isCopied}
                      >
                        {isCopied ? (
                          <Check className='h-3 w-3' />
                        ) : (
                          <Copy className='h-3 w-3' />
                        )}
                        {isCopied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDownload(templateId, content)}
                      >
                        <Download className='mr-1 h-3 w-3' />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className='whitespace-pre-wrap text-sm bg-secondary p-4 rounded-lg overflow-x-auto max-h-96'>
                    {content}
                  </pre>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
