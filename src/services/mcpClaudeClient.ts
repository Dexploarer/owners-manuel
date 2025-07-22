import type { GenerationRequest, GenerationResult } from '@/types';

export interface MCPClientConfig {
  serverUrl: string;
  sessionId?: string;
}

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

export interface MCPToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

/**
 * Browser-based MCP Client for connecting to Claude Code MCP Server
 */
export class MCPClaudeClient {
  private static instance: MCPClaudeClient;
  private config: MCPClientConfig;
  private sessionId?: string;
  private requestId = 0;
  private eventSource?: EventSource;
  private authSessionId?: string;

  private constructor(config: MCPClientConfig) {
    this.config = config;
    this.sessionId = config.sessionId ?? undefined;
  }

  public static getInstance(config?: MCPClientConfig): MCPClaudeClient {
    if (!MCPClaudeClient.instance && config) {
      MCPClaudeClient.instance = new MCPClaudeClient(config);
    }
    return MCPClaudeClient.instance;
  }

  /**
   * Set authentication session ID
   */
  public setAuthSession(sessionId: string): void {
    this.authSessionId = sessionId;
  }

  /**
   * Initialize MCP connection
   */
  public async initialize(): Promise<void> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'initialize',
      params: {
        clientInfo: {
          name: 'user-manual-browser',
          version: '1.0.0'
        }
      }
    };

    const response = await this.sendRequest(request);
    
    if (response.result && typeof response.result === 'object') {
      const result = response.result as { sessionId?: string };
      if (result.sessionId) {
        this.sessionId = result.sessionId;
        this.setupEventSource();
      }
    }
  }

  /**
   * Setup Server-Sent Events for notifications
   */
  private setupEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const url = new URL(`${this.config.serverUrl}/mcp`);
    const headers: HeadersInit = {
      'mcp-session-id': this.sessionId || '',
    };
    
    if (this.authSessionId) {
      headers['x-session-id'] = this.authSessionId;
    }

    // EventSource doesn't support custom headers, so we'll use query params
    url.searchParams.set('session', this.sessionId || '');
    if (this.authSessionId) {
      url.searchParams.set('auth', this.authSessionId);
    }

    this.eventSource = new EventSource(url.toString());

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('MCP notification:', data);
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };
  }

  /**
   * Generate documentation using MCP tool
   */
  public async generateDocuments(request: GenerationRequest): Promise<GenerationResult> {
    const mcpRequest: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'generate-documentation',
        arguments: request
      }
    };

    const response = await this.sendRequest(mcpRequest);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    const result = response.result as MCPToolResult;
    
    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Unknown error');
    }

    // Parse the JSON response from the tool
    const generationResult = JSON.parse(result.content[0]?.text || '{}') as GenerationResult;
    return generationResult;
  }

  /**
   * Create AGENTS.md file
   */
  public async createAgentsMd(params: {
    projectName: string;
    projectDescription: string;
    techStack: Array<{ name: string; version?: string }>;
    customInstructions?: string;
  }): Promise<string> {
    const mcpRequest: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'create-agents-md',
        arguments: params
      }
    };

    const response = await this.sendRequest(mcpRequest);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    const result = response.result as MCPToolResult;
    
    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Unknown error');
    }

    return result.content[0]?.text || '';
  }

  /**
   * Create .cursorrules file
   */
  public async createCursorRules(params: {
    projectName: string;
    projectDescription: string;
    techStack: Array<{ name: string; version?: string }>;
    customInstructions?: string;
  }): Promise<string> {
    const mcpRequest: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'create-cursor-rules',
        arguments: params
      }
    };

    const response = await this.sendRequest(mcpRequest);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    const result = response.result as MCPToolResult;
    
    if (result.isError) {
      throw new Error(result.content[0]?.text || 'Unknown error');
    }

    return result.content[0]?.text || '';
  }

  /**
   * Get server status
   */
  public async getStatus(): Promise<any> {
    const mcpRequest: MCPRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'resources/read',
      params: {
        uri: 'mcp://claude-code/status'
      }
    };

    const response = await this.sendRequest(mcpRequest);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    const result = response.result as { contents: Array<{ text: string }> };
    return JSON.parse(result.contents[0]?.text || '{}');
  }

  /**
   * Close MCP connection
   */
  public async close(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      delete this.eventSource;
    }

    if (this.sessionId) {
      await fetch(`${this.config.serverUrl}/mcp`, {
        method: 'DELETE',
        headers: {
          'mcp-session-id': this.sessionId,
          ...(this.authSessionId && { 'x-session-id': this.authSessionId })
        }
      });
    }
  }

  /**
   * Send MCP request
   */
  private async sendRequest(request: MCPRequest): Promise<MCPResponse> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }

    if (this.authSessionId) {
      headers['x-session-id'] = this.authSessionId;
    }

    const response = await fetch(`${this.config.serverUrl}/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as MCPResponse;
  }

  /**
   * Get next request ID
   */
  private getNextRequestId(): string {
    return `req_${++this.requestId}_${Date.now()}`;
  }

  /**
   * Check if client is connected
   */
  public isConnected(): boolean {
    return !!this.sessionId;
  }

  /**
   * Check authentication status
   */
  public async checkAuthStatus(): Promise<{
    authenticated: boolean;
    user?: { id: string; email: string };
    expiresAt?: Date;
  }> {
    if (!this.authSessionId) {
      return { authenticated: false };
    }

    try {
      const response = await fetch(`${this.config.serverUrl}/auth/session`, {
        headers: {
          'x-session-id': this.authSessionId
        }
      });

      if (!response.ok) {
        return { authenticated: false };
      }

      const data = await response.json();
      const result: {
        authenticated: boolean;
        user?: { id: string; email: string };
        expiresAt?: Date;
      } = {
        authenticated: data.authenticated,
        user: data.user
      };
      
      if (data.expiresAt) {
        result.expiresAt = new Date(data.expiresAt);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to check auth status:', error);
      return { authenticated: false };
    }
  }

  /**
   * Logout
   */
  public async logout(): Promise<void> {
    if (!this.authSessionId) {
      return;
    }

    try {
      await fetch(`${this.config.serverUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'x-session-id': this.authSessionId
        }
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      delete this.authSessionId;
      await this.close();
    }
  }
}

// Export singleton instance with default config
export const mcpClaudeClient = MCPClaudeClient.getInstance({
  serverUrl: 'http://localhost:3001'
});