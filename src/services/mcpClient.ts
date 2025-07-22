import type { TechStack } from '@/types';

// MCP Client types based on the official specification
export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface LibraryDocumentation {
  libraryId: string;
  content: string;
  metadata: {
    version?: string;
    lastUpdated: Date;
    source: string;
    topics: string[];
    snippetCount: number;
  };
}

export interface ResolvedLibrary {
  id: string;
  name: string;
  description: string;
  trustScore: number;
  codeSnippets: number;
  versions?: string[];
}

/**
 * MCP Client for integrating with Context7 and other MCP servers
 * Following July 2025 best practices for security and transport
 */
export class MCPClient {
  private static instance: MCPClient;
  private requestId = 0;

  // Context7 MCP Server endpoint (using HTTP transport as recommended)
  private readonly context7Endpoint = 'https://mcp.context7.com/mcp';

  public static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  private getNextRequestId(): string {
    return `req_${++this.requestId}_${Date.now()}`;
  }

  /**
   * Make an MCP request with proper error handling and security
   */
  private async makeRequest(
    method: string,
    params?: Record<string, unknown>
  ): Promise<MCPResponse> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method,
      ...(params && { params }),
    };

    try {
      const response = await fetch(this.context7Endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'UserManual/1.0 (MCP Client)',
          // Add resource indicators as per RFC 8707 for security
          'Resource-Indicator': this.context7Endpoint,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = (await response.json()) as MCPResponse;

      if (result.error) {
        throw new Error(
          `MCP Error ${result.error.code}: ${result.error.message}`
        );
      }

      return result;
    } catch (error) {
      console.error('MCP Request failed:', error);
      throw new Error(
        error instanceof Error
          ? `MCP request failed: ${error.message}`
          : 'Unknown MCP request error'
      );
    }
  }

  /**
   * Resolve a library name to a Context7-compatible library ID
   */
  public async resolveLibraryId(
    libraryName: string
  ): Promise<ResolvedLibrary[]> {
    try {
      const response = await this.makeRequest('resolve-library-id', {
        libraryName: libraryName.trim(),
      });

      // Parse the response based on Context7's expected format
      if (response.result && typeof response.result === 'object') {
        const result = response.result as { libraries?: ResolvedLibrary[] };
        return result.libraries || [];
      }

      return [];
    } catch (error) {
      console.error(
        `Failed to resolve library ID for "${libraryName}":`,
        error
      );
      throw error;
    }
  }

  /**
   * Get library documentation using Context7-compatible library ID
   */
  public async getLibraryDocumentation(
    libraryId: string,
    options: {
      topic?: string;
      tokens?: number;
    } = {}
  ): Promise<LibraryDocumentation | null> {
    try {
      const response = await this.makeRequest('get-library-docs', {
        context7CompatibleLibraryID: libraryId,
        ...options,
      });

      if (response.result && typeof response.result === 'object') {
        const result = response.result as {
          content?: string;
          metadata?: {
            version?: string;
            source?: string;
            topics?: string[];
            snippetCount?: number;
          };
        };

        if (result.content) {
          return {
            libraryId,
            content: result.content,
            metadata: {
              ...(result.metadata?.version && {
                version: result.metadata.version,
              }),
              lastUpdated: new Date(),
              source: result.metadata?.source || 'Context7',
              topics: result.metadata?.topics || [],
              snippetCount: result.metadata?.snippetCount || 0,
            },
          };
        }
      }

      return null;
    } catch (error) {
      console.error(
        `Failed to get documentation for library "${libraryId}":`,
        error
      );
      throw error;
    }
  }

  /**
   * Get documentation for multiple technologies in parallel
   */
  public async getMultipleLibraryDocs(
    techStack: TechStack[],
    topic?: string
  ): Promise<LibraryDocumentation[]> {
    const results: LibraryDocumentation[] = [];

    // Process in batches to avoid overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < techStack.length; i += batchSize) {
      const batch = techStack.slice(i, i + batchSize);

      const batchPromises = batch.map(async tech => {
        try {
          // First resolve the library ID
          const resolved = await this.resolveLibraryId(tech.name);
          if (resolved.length === 0) {
            console.warn(`No documentation found for ${tech.name}`);
            return null;
          }

          // Get the best match (highest trust score)
          const bestMatch = resolved.reduce((best, current) =>
            current.trustScore > best.trustScore ? current : best
          );

          // Get documentation
          const docs = await this.getLibraryDocumentation(
            bestMatch.id,
            topic ? { topic } : {}
          );
          return docs;
        } catch (error) {
          console.error(`Failed to get docs for ${tech.name}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      });

      // Add delay between batches to be respectful to the server
      if (i + batchSize < techStack.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Build enhanced context for AI document generation
   */
  public async buildDocumentationContext(
    techStack: TechStack[],
    documentType: string
  ): Promise<{
    context: string;
    sources: string[];
    totalSnippets: number;
  }> {
    try {
      // Get relevant topic based on document type
      const topicMap: Record<string, string> = {
        AGENTS_MD: 'development configuration best practices',
        CURSOR_RULES: 'ide configuration coding standards',
        WORKFLOW: 'development workflow deployment',
        TESTING: 'testing framework unit integration',
        SECURITY: 'security authentication authorization',
        PERFORMANCE: 'performance optimization monitoring',
      };

      const topic = topicMap[documentType] || 'development';

      // Fetch documentation for all technologies
      const documentation = await this.getMultipleLibraryDocs(techStack, topic);

      if (documentation.length === 0) {
        return {
          context:
            'No specific library documentation found. Using general best practices.',
          sources: [],
          totalSnippets: 0,
        };
      }

      // Build comprehensive context
      const contextSections = documentation.map(doc => {
        return `## ${doc.libraryId} Documentation\n\n${doc.content}\n`;
      });

      const context = [
        '# Library-Specific Documentation Context\n',
        'The following documentation provides up-to-date information about the technologies in this project:\n',
        ...contextSections,
        '\n# Integration Guidelines\n',
        'Use this documentation to provide specific, accurate guidance that reflects the latest versions and best practices for each technology.',
      ].join('\n');

      const sources = documentation.map(doc => doc.metadata.source);
      const totalSnippets = documentation.reduce(
        (sum, doc) => sum + doc.metadata.snippetCount,
        0
      );

      return {
        context,
        sources: [...new Set(sources)], // Remove duplicates
        totalSnippets,
      };
    } catch (error) {
      console.error('Failed to build documentation context:', error);
      return {
        context:
          'Failed to fetch library-specific documentation. Using general guidance.',
        sources: [],
        totalSnippets: 0,
      };
    }
  }

  /**
   * Health check to verify MCP server connectivity
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Try a simple request to verify connectivity
      await this.makeRequest('tools/list');
      return true;
    } catch (error) {
      console.error('MCP health check failed:', error);
      return false;
    }
  }
}

export const mcpClient = MCPClient.getInstance();
