import React, { useState } from 'react';
import {
  Play,
  Download,
  Copy,
  Settings,
  Github,
  FileText,
  AlertCircle,
  Check,
  Loader2,
  Code,
  Shield,
  Clock,
  Zap,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GitHubActionTrigger } from '@/types';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'security' | 'testing';
  triggers: GitHubActionTrigger[];
  features: string[];
  content: string;
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'basic-claude',
    name: 'Basic Claude Assistant',
    description: 'Simple @claude integration for issues and PRs',
    category: 'basic',
    triggers: [
      { event: 'issue_comment', conditions: { types: ['created'] } },
      { event: 'issues', conditions: { types: ['opened'] } },
    ],
    features: ['@claude mentions', 'Issue support', 'Basic PR review'],
    content: `name: Claude Assistant
on:
  issue_comment:
    types: [created]
  issues:
    types: [opened, assigned]

jobs:
  claude-response:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
      pull-requests: write
      id-token: write
    steps:
      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          github_token: \${{ secrets.GITHUB_TOKEN }}
          trigger_phrase: "@claude"
          max_turns: "3"`,
  },
  {
    id: 'comprehensive-claude',
    name: 'Comprehensive Claude Integration',
    description: 'Full-featured Claude with custom instructions and tools',
    category: 'advanced',
    triggers: [
      { event: 'issue_comment', conditions: { types: ['created'] } },
      {
        event: 'pull_request',
        conditions: { types: ['opened', 'synchronize'] },
      },
      { event: 'issues', conditions: { types: ['opened', 'assigned'] } },
    ],
    features: [
      'Full PR support',
      'Custom instructions',
      'Extended tools',
      'Automated reviews',
    ],
    content: `name: Claude Comprehensive Assistant
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]
  pull_request:
    types: [opened, synchronize, ready_for_review]

jobs:
  claude-response:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          github_token: \${{ secrets.GITHUB_TOKEN }}
          trigger_phrase: "@claude"
          max_turns: "5"
          model: "claude-3-5-sonnet-20241022"
          custom_instructions: |
            You are a helpful AI assistant for this project.
            When reviewing code:
            - Focus on code quality, security, and performance
            - Suggest improvements following best practices
            - Check for TypeScript/JavaScript specific issues
            - Ensure proper error handling and testing
            
            When making changes:
            - Follow existing code style and patterns
            - Add appropriate comments and documentation
            - Ensure changes are well-tested
          
          allowed_tools: |
            Edit
            Read
            Glob
            Write
            Bash(npm install)
            Bash(npm run test)
            Bash(npm run lint)
            Bash(git add)
            Bash(git commit)`,
  },
  {
    id: 'security-focused',
    name: 'Security-Focused Claude',
    description: 'Claude with enhanced security review capabilities',
    category: 'security',
    triggers: [
      {
        event: 'pull_request',
        conditions: { types: ['opened', 'synchronize'] },
      },
    ],
    features: [
      'Security scanning',
      'Dependency review',
      'Code analysis',
      'Compliance checks',
    ],
    content: `name: Claude Security Review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
    paths:
      - '**/*.js'
      - '**/*.ts'
      - '**/*.tsx'
      - '**/*.jsx'
      - 'package*.json'
      - '**/*.py'

jobs:
  security-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      security-events: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          github_token: \${{ secrets.GITHUB_TOKEN }}
          direct_prompt: |
            Perform a comprehensive security review of this pull request.
            
            Focus on:
            1. Input validation and sanitization
            2. Authentication and authorization flaws
            3. SQL injection and XSS vulnerabilities
            4. Dependency security issues
            5. Data exposure risks
            6. Access control problems
            7. Cryptographic issues
            8. Configuration security
            
            Provide specific recommendations for any issues found.
            If no security issues are found, provide a brief confirmation.
          
          max_turns: "3"
          model: "claude-3-5-sonnet-20241022"
          allowed_tools: |
            Read
            Glob`,
  },
  {
    id: 'automated-testing',
    name: 'Claude Test Assistant',
    description: 'Automated test generation and review with Claude',
    category: 'testing',
    triggers: [
      { event: 'pull_request', conditions: { types: ['opened'] } },
      { event: 'issue_comment', conditions: { types: ['created'] } },
    ],
    features: [
      'Test generation',
      'Test review',
      'Coverage analysis',
      'Test automation',
    ],
    content: `name: Claude Test Assistant
on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  test-assistance:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run existing tests
        run: npm test -- --coverage || true
      
      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          github_token: \${{ secrets.GITHUB_TOKEN }}
          trigger_phrase: "@claude"
          custom_instructions: |
            You are a test automation specialist. Help with:
            
            For new code:
            - Generate comprehensive unit tests
            - Create integration tests where appropriate
            - Ensure good test coverage
            - Follow testing best practices
            
            For test reviews:
            - Check test completeness and coverage
            - Verify test quality and maintainability
            - Suggest improvements for better testing
            - Identify edge cases that need testing
            
            Always use the project's existing testing framework and patterns.
          
          allowed_tools: |
            Edit
            Read
            Write
            Bash(npm test)
            Bash(npm run test:coverage)
            Bash(npm run lint)`,
  },
];

export const GitHubActionsGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [_customWorkflow, _setCustomWorkflow] = useState('');
  const [projectName, setProjectName] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [generatedWorkflow, setGeneratedWorkflow] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTemplateSelect = (template: WorkflowTemplate): void => {
    setSelectedTemplate(template);
    setGeneratedWorkflow('');
  };

  const handleGenerate = (): void => {
    if (!selectedTemplate) return;

    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      let workflow = selectedTemplate.content;

      // Customize workflow based on inputs
      if (projectName) {
        workflow = workflow.replace(
          'You are a helpful AI assistant for this project.',
          `You are a helpful AI assistant for the ${projectName} project.`
        );
      }

      if (additionalInstructions) {
        workflow = workflow.replace(
          'custom_instructions: |',
          `custom_instructions: |\n            ${additionalInstructions}\n            `
        );
      }

      setGeneratedWorkflow(workflow);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(generatedWorkflow);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (): void => {
    const blob = new Blob([generatedWorkflow], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claude.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'basic':
        return <Play className='h-4 w-4 text-blue-600' />;
      case 'advanced':
        return <Zap className='h-4 w-4 text-purple-600' />;
      case 'security':
        return <Shield className='h-4 w-4 text-red-600' />;
      case 'testing':
        return <Code className='h-4 w-4 text-green-600' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Github className='mr-2 h-6 w-6' />
            GitHub Actions Workflow Generator
          </CardTitle>
          <p className='text-muted-foreground'>
            Generate custom GitHub Actions workflows for Claude integration
          </p>
        </CardHeader>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Workflow Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {workflowTemplates.map(template => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center space-x-2'>
                    {getCategoryIcon(template.category)}
                    <h3 className='font-medium'>{template.name}</h3>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <Check className='h-4 w-4 text-primary' />
                  )}
                </div>

                <p className='text-sm text-muted-foreground mb-3'>
                  {template.description}
                </p>

                <div className='space-y-2'>
                  <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                    <Clock className='h-3 w-3' />
                    <span>
                      Triggers: {template.triggers.map(t => t.event).join(', ')}
                    </span>
                  </div>

                  <div className='flex flex-wrap gap-1'>
                    {template.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className='px-2 py-1 text-xs bg-secondary rounded-full'
                      >
                        {feature}
                      </span>
                    ))}
                    {template.features.length > 3 && (
                      <span className='px-2 py-1 text-xs bg-secondary/60 rounded-full'>
                        +{template.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customization */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Settings className='mr-2 h-5 w-5' />
              Customize Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='project-name'>Project Name (Optional)</Label>
                <Input
                  id='project-name'
                  placeholder='My Awesome Project'
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>Selected Template</Label>
                <div className='flex items-center space-x-2 p-2 bg-secondary/50 rounded'>
                  {getCategoryIcon(selectedTemplate.category)}
                  <span className='text-sm'>{selectedTemplate.name}</span>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='additional-instructions'>
                Additional Instructions (Optional)
              </Label>
              <Textarea
                id='additional-instructions'
                placeholder='Add any specific instructions or requirements for Claude...'
                value={additionalInstructions}
                onChange={e => setAdditionalInstructions(e.target.value)}
                className='min-h-[100px]'
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      {selectedTemplate && (
        <Card>
          <CardContent className='pt-6'>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className='w-full h-12'
              size='lg'
            >
              {isGenerating ? (
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              ) : (
                <Play className='mr-2 h-5 w-5' />
              )}
              Generate Workflow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Workflow */}
      {generatedWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center'>
                <FileText className='mr-2 h-5 w-5' />
                Generated Workflow
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? (
                    <Check className='h-3 w-3' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant='outline' size='sm' onClick={handleDownload}>
                  <Download className='mr-1 h-3 w-3' />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Setup Instructions */}
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-start space-x-2'>
                  <AlertCircle className='h-4 w-4 text-blue-600 mt-0.5' />
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium text-blue-900'>
                      Setup Instructions
                    </h4>
                    <ol className='text-xs text-blue-800 space-y-1 ml-4'>
                      <li>
                        1. Create{' '}
                        <code className='bg-blue-100 px-1 rounded'>
                          .github/workflows/claude.yml
                        </code>{' '}
                        in your repository
                      </li>
                      <li>
                        2. Add{' '}
                        <code className='bg-blue-100 px-1 rounded'>
                          ANTHROPIC_API_KEY
                        </code>{' '}
                        to repository secrets
                      </li>
                      <li>3. Copy the workflow content below into the file</li>
                      <li>4. Commit and push to activate the workflow</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Workflow Content */}
              <div className='relative'>
                <pre className='bg-secondary p-4 rounded-lg text-xs overflow-x-auto max-h-96 border'>
                  <code>{generatedWorkflow}</code>
                </pre>
              </div>

              {/* Usage Examples */}
              <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-start space-x-2'>
                  <GitBranch className='h-4 w-4 text-green-600 mt-0.5' />
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium text-green-900'>
                      Usage Examples
                    </h4>
                    <ul className='text-xs text-green-800 space-y-1 ml-4 font-mono'>
                      <li>• @claude review this code</li>
                      <li>• @claude fix the bug in src/utils.ts</li>
                      <li>• @claude generate tests for this function</li>
                      <li>• @claude update the documentation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
