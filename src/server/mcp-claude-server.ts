import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import type { Request, Response } from 'express';

// Import our Claude service
import { claudeService } from '../services/claude';
import type { GenerationRequest, GenerationResult } from '@/types';
import { setupAuthRoutes, requireAuth, type OAuthConfig } from './auth/oauth-provider';

const app = express();
app.use(express.json());

// Configure CORS for browser access
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id', 'Authorization'],
  credentials: true
}));

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Create MCP server instance
const createMcpServer = () => {
  const server = new McpServer({
    name: 'claude-code-mcp',
    version: '1.0.0'
  });

  // Register tool for generating documentation
  server.registerTool(
    'generate-documentation',
    {
      title: 'Generate Documentation',
      description: 'Generate AI-powered documentation using Claude',
      inputSchema: z.object({
        projectId: z.string(),
        templateIds: z.array(z.string()),
        customPrompt: z.string().optional(),
        variables: z.record(z.unknown()),
        options: z.object({
          includeComments: z.boolean(),
          detailLevel: z.enum(['basic', 'detailed', 'comprehensive']),
          outputFormat: z.enum(['markdown', 'json', 'yaml'])
        })
      })
    },
    async (params) => {
      try {
        const request: GenerationRequest = {
          projectId: (params as any).projectId,
          templateIds: (params as any).templateIds,
          customPrompt: (params as any).customPrompt,
          variables: (params as any).variables,
          options: (params as any).options
        };

        const result: GenerationResult = await claudeService.generateDocuments(request);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error generating documentation: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Register tool for creating AGENTS.md
  server.registerTool(
    'create-agents-md',
    {
      title: 'Create AGENTS.md',
      description: 'Create a comprehensive AGENTS.md file for AI coding agents',
      inputSchema: z.object({
        projectName: z.string(),
        projectDescription: z.string(),
        techStack: z.array(z.object({
          name: z.string(),
          version: z.string().optional()
        })),
        customInstructions: z.string().optional()
      })
    },
    async (params) => {
      try {
        const request: GenerationRequest = {
          projectId: `project_${Date.now()}`,
          templateIds: ['agents-md'],
          customPrompt: (params as any).customInstructions,
          variables: {
            projectName: (params as any).projectName,
            projectDescription: (params as any).projectDescription,
            techStack: (params as any).techStack
          },
          options: {
            includeComments: true,
            detailLevel: 'comprehensive',
            outputFormat: 'markdown'
          }
        };

        const result = await claudeService.generateDocuments(request);
        const document = result.documents[0];

        return {
          content: [{
            type: 'text',
            text: document ? document.content : 'No content generated'
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error creating AGENTS.md: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Register tool for creating .cursorrules
  server.registerTool(
    'create-cursor-rules',
    {
      title: 'Create .cursorrules',
      description: 'Create a .cursorrules file for Cursor IDE configuration',
      inputSchema: z.object({
        projectName: z.string(),
        projectDescription: z.string(),
        techStack: z.array(z.object({
          name: z.string(),
          version: z.string().optional()
        })),
        customInstructions: z.string().optional()
      })
    },
    async (params) => {
      try {
        const request: GenerationRequest = {
          projectId: `project_${Date.now()}`,
          templateIds: ['cursor-rules'],
          customPrompt: (params as any).customInstructions,
          variables: {
            projectName: (params as any).projectName,
            projectDescription: (params as any).projectDescription,
            techStack: (params as any).techStack
          },
          options: {
            includeComments: true,
            detailLevel: 'detailed',
            outputFormat: 'markdown'
          }
        };

        const result = await claudeService.generateDocuments(request);
        const document = result.documents[0];

        return {
          content: [{
            type: 'text',
            text: document ? document.content : 'No content generated'
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error creating .cursorrules: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Register a resource for server status
  server.registerResource(
    'status',
    'mcp://claude-code/status',
    {
      title: 'Server Status',
      description: 'Current status of the Claude Code MCP server',
      mimeType: 'application/json'
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          server: 'claude-code-mcp',
          version: '1.0.0',
          status: 'running',
          activeSessions: Object.keys(transports).length,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    })
  );

  return server;
};

// Setup OAuth authentication
const oauthConfig: OAuthConfig = {
  clientId: process.env['OAUTH_CLIENT_ID'] || 'demo-client-id',
  clientSecret: process.env['OAUTH_CLIENT_SECRET'] || 'demo-client-secret',
  authorizationUrl: process.env['OAUTH_AUTH_URL'] || 'https://github.com/login/oauth/authorize',
  tokenUrl: process.env['OAUTH_TOKEN_URL'] || 'https://github.com/login/oauth/access_token',
  revocationUrl: process.env['OAUTH_REVOKE_URL'],
  redirectUri: process.env['OAUTH_REDIRECT_URI'] || 'http://localhost:3001/auth/callback',
  scopes: process.env['OAUTH_SCOPES']?.split(',') || ['read:user', 'user:email'],
};

setupAuthRoutes(app, oauthConfig);

// Handle POST requests for client-to-server communication
app.post('/mcp', requireAuth, async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && req.body.jsonrpc === '2.0' && req.body.method === 'initialize') {
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        // Store the transport by session ID
        transports[newSessionId] = transport;
      },
      // Enable DNS rebinding protection for local development
      enableDnsRebindingProtection: true,
      allowedHosts: ['127.0.0.1', 'localhost'],
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    // Create and connect MCP server
    const server = createMcpServer();
    await server.connect(transport);
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', requireAuth, async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Handle DELETE requests for session termination
app.delete('/mcp', requireAuth, async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    server: 'claude-code-mcp',
    activeSessions: Object.keys(transports).length,
    timestamp: new Date().toISOString()
  });
});

// Start the MCP server
const PORT = process.env['MCP_PORT'] || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Claude Code MCP Server running at http://localhost:${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export { app };