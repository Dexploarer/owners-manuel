import Anthropic from '@anthropic-ai/sdk';
import type {
  AIModel,
  GenerationRequest,
  GenerationResult,
  Document,
  DocumentType,
  TechStack,
} from '@/types';
import { mcpClient } from './mcpClient';

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'] || '',
});

export class ClaudeService {
  private static instance: ClaudeService;

  public static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService();
    }
    return ClaudeService.instance;
  }

  public async generateDocuments(
    request: GenerationRequest
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      const documents: Document[] = [];
      let totalTokens = 0;
      const errors: string[] = [];

      // Generate documents for each requested template
      for (const templateId of request.templateIds) {
        try {
          const document = await this.generateSingleDocument(
            templateId,
            request
          );
          documents.push(document);
          totalTokens += document.performance.tokenUsage.total;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push(
            `Failed to generate document for template ${templateId}: ${errorMessage}`
          );
        }
      }

      const generationTime = Date.now() - startTime;

      return {
        documents,
        metadata: {
          totalTokens,
          generationTime,
          modelUsed: this.getDefaultModel(),
          success: errors.length === 0,
          ...(errors.length > 0 && { errors }),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        documents: [],
        metadata: {
          totalTokens: 0,
          generationTime: Date.now() - startTime,
          modelUsed: this.getDefaultModel(),
          success: false,
          errors: [errorMessage],
        },
      };
    }
  }

  private async generateSingleDocument(
    templateId: string,
    request: GenerationRequest
  ): Promise<Document> {
    const startTime = Date.now();

    // Get MCP-enhanced context for better documentation
    let mcpContext = '';
    let sources: string[] = [];
    let totalSnippets = 0;

    try {
      const techStack = (request.variables['techStack'] as TechStack[]) || [];
      if (techStack.length > 0) {
        const contextData = await mcpClient.buildDocumentationContext(
          techStack,
          this.getDocumentType(templateId)
        );
        mcpContext = contextData.context;
        sources = contextData.sources;
        totalSnippets = contextData.totalSnippets;
      }
    } catch (error) {
      console.warn(
        'MCP context fetch failed, continuing with base prompt:',
        error
      );
    }

    const prompt = this.buildPrompt(templateId, request, mcpContext);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const generationTime = Date.now() - startTime;
    const content = this.extractContent(response);

    return {
      id: this.generateId(),
      projectId: request.projectId,
      type: this.getDocumentType(templateId),
      title: this.getDocumentTitle(templateId),
      content,
      version: 1,
      generatedBy: this.getDefaultModel(),
      performance: {
        generationTime,
        tokenUsage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens,
        },
        qualityScore: 0.85, // This would be calculated based on various metrics
        userSatisfaction: 0,
      },
      feedback: [],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private buildPrompt(
    templateId: string,
    request: GenerationRequest,
    mcpContext?: string
  ): string {
    const basePrompt = this.getBasePrompt(templateId);
    const contextPrompt = this.buildContextPrompt(request);
    const variablesPrompt = this.buildVariablesPrompt(request.variables);
    const optionsPrompt = this.buildOptionsPrompt(request.options);

    // Add MCP context if available
    const mcpPrompt = mcpContext
      ? `\n\n# Up-to-Date Library Documentation\n${mcpContext}`
      : '';

    return `${basePrompt}\n\n${contextPrompt}\n\n${variablesPrompt}\n\n${optionsPrompt}${mcpPrompt}`;
  }

  private getBasePrompt(templateId: string): string {
    const prompts: Record<string, string> = {
      'agents-md': `You are an expert AI documentation specialist with access to up-to-date library documentation. Create a comprehensive AGENTS.md file that will guide AI coding agents to work effectively with this project. 

IMPORTANT: Use the provided up-to-date library documentation to ensure accuracy and current best practices. Do NOT rely on outdated training data.

The file should include:

1. Project Overview and Architecture
2. Technology-Specific Guidelines (use the provided documentation)
3. Development Guidelines and Best Practices
4. Code Style and Formatting Rules
5. Testing Requirements and Strategies
6. Deployment and CI/CD Instructions
7. AI Agent-Specific Instructions
8. Common Patterns and Anti-patterns
9. Troubleshooting Guide

Make the documentation clear, actionable, and optimized for AI agent consumption. Reference specific versions and features from the provided documentation.`,

      'cursor-rules': `You are an expert in Cursor IDE configuration with access to up-to-date library documentation. Create a comprehensive .cursorrules file that will optimize AI-assisted development in Cursor.

IMPORTANT: Use the provided up-to-date library documentation to ensure framework-specific rules are accurate and current. Do NOT rely on outdated training data.

The file should include:

1. Technology-Specific Rules (use provided documentation)
2. Coding standards and style preferences
3. Framework-specific best practices  
4. File organization rules
5. Testing requirements
6. Performance considerations
7. Security guidelines
8. Code review criteria
9. AI assistance preferences

Format the output as a proper .cursorrules file with clear, specific instructions that reference current versions and features.`,

      workflow: `You are a development workflow expert with access to up-to-date library documentation. Create a comprehensive development workflow guide that covers:

IMPORTANT: Use the provided up-to-date library documentation to ensure technology-specific workflow recommendations are accurate and current.

1. Technology-Specific Workflows (use provided documentation)
2. Git workflow and branching strategy
3. Code review process
4. Testing workflow
5. Deployment procedures
6. Issue tracking and project management
7. Team collaboration guidelines
8. Quality assurance processes
9. Documentation requirements

Make it actionable and specific to the project's technology stack, referencing current versions and best practices.`,
    };

    return prompts[templateId] || 'Create documentation for this project.';
  }

  private buildContextPrompt(request: GenerationRequest): string {
    return `Project Context:
${request.customPrompt || 'No additional context provided.'}

Please generate documentation that is:
- Specific to this project's needs
- Actionable and clear
- Optimized for AI agent consumption
- Following modern best practices`;
  }

  private buildVariablesPrompt(variables: Record<string, unknown>): string {
    if (Object.keys(variables).length === 0) {
      return 'No specific variables provided.';
    }

    const variablesList = Object.entries(variables)
      .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
      .join('\n');

    return `Project Variables:\n${variablesList}`;
  }

  private buildOptionsPrompt(options: GenerationRequest['options']): string {
    return `Generation Options:
- Include Comments: ${options.includeComments}
- Detail Level: ${options.detailLevel}
- Output Format: ${options.outputFormat}

Please format the output according to these preferences.`;
  }

  private extractContent(response: Anthropic.Messages.Message): string {
    if (response.content[0]?.type === 'text') {
      return response.content[0].text;
    }
    return 'No content generated';
  }

  private getDocumentType(templateId: string): DocumentType {
    const typeMap: Record<string, DocumentType> = {
      'agents-md': 'AGENTS_MD',
      'cursor-rules': 'CURSOR_RULES',
      workflow: 'WORKFLOW',
      testing: 'TESTING',
      security: 'SECURITY',
      performance: 'PERFORMANCE',
    };

    return typeMap[templateId] || 'README';
  }

  private getDocumentTitle(templateId: string): string {
    const titleMap: Record<string, string> = {
      'agents-md': 'AGENTS.md',
      'cursor-rules': '.cursorrules',
      workflow: 'Development Workflow',
      testing: 'Testing Strategy',
      security: 'Security Guidelines',
      performance: 'Performance Guide',
    };

    return titleMap[templateId] || 'Documentation';
  }

  private getDefaultModel(): AIModel {
    return {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      version: '2024-10-22',
      parameters: {
        temperature: 0.3,
        maxTokens: 4000,
        topP: 0.9,
      },
    };
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const claudeService = ClaudeService.getInstance();
