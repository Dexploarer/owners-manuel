// Claude Code SDK is not available in browser environment
// This is a stub implementation for browser compatibility
import type { GenerationRequest, TechStack } from '@/types';

export interface SDKMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ClaudeCodeOptions {
  maxTurns?: number;
  cwd?: string;
  outputFormat?: 'text' | 'json' | 'stream-json';
  systemPrompt?: string;
  appendSystemPrompt?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  mcpConfig?: string;
  permissionPromptTool?: string;
}

export interface ClaudeCodeResult {
  messages: SDKMessage[];
  success: boolean;
  error?: string;
}

/**
 * Claude Code Service - Integrates with the official Claude Code SDK
 * for programmatic access to Claude's coding capabilities
 */
export class ClaudeCodeService {
  private static instance: ClaudeCodeService;

  public static getInstance(): ClaudeCodeService {
    if (!ClaudeCodeService.instance) {
      ClaudeCodeService.instance = new ClaudeCodeService();
    }
    return ClaudeCodeService.instance;
  }

  /**
   * Generate documentation using Claude Code SDK
   */
  public async generateWithClaudeCode(
    prompt: string,
    options: ClaudeCodeOptions = {}
  ): Promise<ClaudeCodeResult> {
    try {
      const messages: SDKMessage[] = [];

      // Configure Claude Code query options
      const queryOptions = {
        prompt,
        options: {
          maxTurns: options.maxTurns || 5,
          outputFormat: options.outputFormat || 'text',
        },
        cwd: options.cwd || process.cwd(),
        ...(options.systemPrompt && { systemPrompt: options.systemPrompt }),
        ...(options.appendSystemPrompt && {
          appendSystemPrompt: options.appendSystemPrompt,
        }),
        ...(options.allowedTools && { allowedTools: options.allowedTools }),
        ...(options.disallowedTools && {
          disallowedTools: options.disallowedTools,
        }),
        ...(options.mcpConfig && { mcpConfig: options.mcpConfig }),
        ...(options.permissionPromptTool && {
          permissionPromptTool: options.permissionPromptTool,
        }),
      };

      // Claude Code SDK is not available in browser environment
      // Return a stub response
      messages.push({
        role: 'assistant',
        content: 'Claude Code SDK is not available in browser environment. This feature requires a Node.js runtime.'
      });

      return {
        messages,
        success: false,
        error: 'Claude Code SDK requires Node.js runtime and is not available in browser',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        messages: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generate AGENTS.md using Claude Code with project context
   */
  public async generateAgentsMd(
    request: GenerationRequest
  ): Promise<ClaudeCodeResult> {
    const techStackList = (request.variables['techStack'] as TechStack[]) || [];
    const techStackString = techStackList
      .map(tech => `${tech.name} ${tech.version || ''}`)
      .join(', ');

    const prompt = `Create a comprehensive AGENTS.md file for this project:

Project: ${request.variables['projectName']}
Description: ${request.variables['projectDescription']}
Tech Stack: ${techStackString}

${request.customPrompt ? `Additional Context: ${request.customPrompt}` : ''}

The AGENTS.md file should include:
1. Project Overview and Architecture
2. Technology-Specific Guidelines
3. Development Guidelines and Best Practices
4. Code Style and Formatting Rules
5. Testing Requirements and Strategies
6. Deployment and CI/CD Instructions
7. AI Agent-Specific Instructions
8. Common Patterns and Anti-patterns
9. Troubleshooting Guide

Make the documentation clear, actionable, and optimized for AI agent consumption.`;

    return this.generateWithClaudeCode(prompt, {
      maxTurns: 3,
      allowedTools: ['Read', 'Glob', 'Edit', 'Write'],
      systemPrompt:
        'You are an expert AI documentation specialist. Create comprehensive, actionable documentation optimized for AI agent consumption.',
    });
  }

  /**
   * Generate .cursorrules using Claude Code with project context
   */
  public async generateCursorRules(
    request: GenerationRequest
  ): Promise<ClaudeCodeResult> {
    const techStackList = (request.variables['techStack'] as TechStack[]) || [];
    const techStackString = techStackList
      .map(tech => `${tech.name} ${tech.version || ''}`)
      .join(', ');

    const prompt = `Create a comprehensive .cursorrules file for this project:

Project: ${request.variables['projectName']}
Description: ${request.variables['projectDescription']}
Tech Stack: ${techStackString}

${request.customPrompt ? `Additional Context: ${request.customPrompt}` : ''}

The .cursorrules file should include:
1. Technology-Specific Rules
2. Coding standards and style preferences
3. Framework-specific best practices  
4. File organization rules
5. Testing requirements
6. Performance considerations
7. Security guidelines
8. Code review criteria
9. AI assistance preferences

Format the output as a proper .cursorrules file with clear, specific instructions.`;

    return this.generateWithClaudeCode(prompt, {
      maxTurns: 3,
      allowedTools: ['Read', 'Glob', 'Edit', 'Write'],
      systemPrompt:
        'You are an expert in Cursor IDE configuration. Create comprehensive .cursorrules that optimize AI-assisted development.',
    });
  }

  /**
   * Generate development workflow documentation using Claude Code
   */
  public async generateWorkflow(
    request: GenerationRequest
  ): Promise<ClaudeCodeResult> {
    const techStackList = (request.variables['techStack'] as TechStack[]) || [];
    const techStackString = techStackList
      .map(tech => `${tech.name} ${tech.version || ''}`)
      .join(', ');

    const prompt = `Create a comprehensive development workflow guide for this project:

Project: ${request.variables['projectName']}
Description: ${request.variables['projectDescription']}
Tech Stack: ${techStackString}

${request.customPrompt ? `Additional Context: ${request.customPrompt}` : ''}

The workflow guide should cover:
1. Technology-Specific Workflows
2. Git workflow and branching strategy
3. Code review process
4. Testing workflow
5. Deployment procedures
6. Issue tracking and project management
7. Team collaboration guidelines
8. Quality assurance processes
9. Documentation requirements

Make it actionable and specific to the project's technology stack.`;

    return this.generateWithClaudeCode(prompt, {
      maxTurns: 3,
      allowedTools: ['Read', 'Glob', 'Edit', 'Write'],
      systemPrompt:
        'You are a development workflow expert. Create comprehensive workflow guides that enhance team productivity.',
    });
  }

  /**
   * Parse @claude commands from GitHub comments
   */
  public parseClaudeCommand(commentBody: string): {
    isClaudeCommand: boolean;
    command?: string;
    prompt?: string;
    options?: ClaudeCodeOptions;
  } {
    // Look for @claude mentions
    const claudePattern = /@claude\s+(.+)/i;
    const match = claudePattern.exec(commentBody);

    if (!match) {
      return { isClaudeCommand: false };
    }

    const commandText = match[1]?.trim() ?? '';

    // Parse different command types
    if (commandText.startsWith('generate')) {
      return {
        isClaudeCommand: true,
        command: 'generate',
        prompt: commandText,
        options: {
          maxTurns: 5,
          allowedTools: ['Read', 'Glob', 'Edit', 'Write'],
        },
      };
    }

    if (commandText.startsWith('review')) {
      return {
        isClaudeCommand: true,
        command: 'review',
        prompt: `Please review this code and provide detailed feedback: ${commandText.substring(6)}`,
        options: {
          maxTurns: 3,
          allowedTools: ['Read', 'Glob'],
        },
      };
    }

    if (commandText.startsWith('fix')) {
      return {
        isClaudeCommand: true,
        command: 'fix',
        prompt: `Please fix this issue: ${commandText.substring(3)}`,
        options: {
          maxTurns: 5,
          allowedTools: ['Read', 'Glob', 'Edit', 'Write'],
        },
      };
    }

    // Default: treat as general prompt
    return {
      isClaudeCommand: true,
      command: 'general',
      prompt: commandText,
      options: {
        maxTurns: 3,
        allowedTools: ['Read', 'Glob'],
      },
    };
  }

  /**
   * Execute @claude command from GitHub
   */
  public async executeClaudeCommand(
    command: string,
    prompt: string,
    options: ClaudeCodeOptions = {},
    repositoryPath?: string
  ): Promise<ClaudeCodeResult> {
    const executionOptions: ClaudeCodeOptions = {
      ...options,
      cwd: repositoryPath || process.cwd(),
    };

    switch (command) {
      case 'generate':
        return this.generateWithClaudeCode(prompt, executionOptions);

      case 'review':
        return this.generateWithClaudeCode(prompt, {
          ...executionOptions,
          systemPrompt:
            'You are a senior code reviewer. Provide thorough, constructive feedback focusing on code quality, best practices, and potential improvements.',
        });

      case 'fix':
        return this.generateWithClaudeCode(prompt, {
          ...executionOptions,
          systemPrompt:
            'You are a debugging expert. Analyze the code, identify issues, and provide working solutions.',
        });

      default:
        return this.generateWithClaudeCode(prompt, executionOptions);
    }
  }

  /**
   * Generate rule files (AGENTS.md, .cursorrules) based on template selection
   */
  public async generateRules(
    templates: string[],
    request: GenerationRequest
  ): Promise<Record<string, ClaudeCodeResult>> {
    const results: Record<string, ClaudeCodeResult> = {};

    for (const templateId of templates) {
      switch (templateId) {
        case 'agents-md':
          results[templateId] = await this.generateAgentsMd(request);
          break;
        case 'cursor-rules':
          results[templateId] = await this.generateCursorRules(request);
          break;
        case 'workflow':
          results[templateId] = await this.generateWorkflow(request);
          break;
        default:
          // Generate custom documentation
          results[templateId] = await this.generateWithClaudeCode(
            `Generate ${templateId} documentation for this project: ${JSON.stringify(request.variables)}`,
            { maxTurns: 3 }
          );
      }
    }

    return results;
  }

  /**
   * Check if Claude Code SDK is properly configured
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - try to query Claude Code with a basic prompt
      const result = await this.generateWithClaudeCode(
        'Hello, are you working?',
        {
          maxTurns: 1,
          outputFormat: 'json',
        }
      );
      return result.success && result.messages.length > 0;
    } catch (error) {
      console.error('Claude Code health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const claudeCodeService = ClaudeCodeService.getInstance();
