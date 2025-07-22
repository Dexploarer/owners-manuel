import { ProxyOAuthServerProvider } from '@modelcontextprotocol/sdk/server/auth/providers/proxyProvider.js';
import { mcpAuthRouter } from '@modelcontextprotocol/sdk/server/auth/router.js';
import type { Express } from 'express';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  revocationUrl?: string | undefined;
  redirectUri: string;
  scopes: string[];
}

// Store for user sessions (in production, use Redis or similar)
export const userSessions = new Map<string, {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email: string;
  expiresAt: Date;
}>();

export function setupOAuthProvider(config: OAuthConfig) {
  const proxyProvider = new ProxyOAuthServerProvider({
    endpoints: {
      authorizationUrl: config.authorizationUrl,
      tokenUrl: config.tokenUrl,
      revocationUrl: config.revocationUrl,
    },
    verifyAccessToken: async (token) => {
      // In production, verify token with the OAuth provider
      // For now, check if token exists in our sessions
      for (const [sessionId, session] of userSessions) {
        if (session.accessToken === token) {
          return {
            token,
            clientId: config.clientId,
            scopes: config.scopes,
          };
        }
      }
      throw new Error('Invalid access token');
    },
    getClient: async (clientId) => {
      if (clientId !== config.clientId) {
        throw new Error('Unknown client ID');
      }
      return {
        client_id: config.clientId,
        redirect_uris: [config.redirectUri],
      };
    }
  });

  return proxyProvider;
}

export function setupAuthRoutes(app: Express, config: OAuthConfig) {
  const provider = setupOAuthProvider(config);
  
  // Use MCP auth router for OAuth endpoints
  app.use('/auth', mcpAuthRouter({
    provider,
    issuerUrl: new URL(process.env['AUTH_ISSUER_URL'] || 'http://localhost:3001'),
    baseUrl: new URL(process.env['MCP_BASE_URL'] || 'http://localhost:3001'),
    serviceDocumentationUrl: new URL('https://github.com/Dexploarer/owners-manuel'),
  }));

  // Custom login endpoint
  app.get('/auth/login', (req, res) => {
    const authUrl = new URL(config.authorizationUrl);
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', config.scopes.join(' '));
    authUrl.searchParams.set('state', generateState());
    
    res.redirect(authUrl.toString());
  });

  // OAuth callback endpoint
  app.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      res.status(400).send('Missing authorization code');
      return;
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();
      const sessionId = generateSessionId();

      // Store session
      userSessions.set(sessionId, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userId: 'user_' + Date.now(), // In production, get from token or user info endpoint
        email: 'user@example.com', // In production, get from token or user info endpoint
        expiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
      });

      // Redirect to frontend with session ID
      res.redirect(`http://localhost:3000/?session=${sessionId}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Logout endpoint
  app.post('/auth/logout', (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (sessionId && userSessions.has(sessionId)) {
      const session = userSessions.get(sessionId);
      
      // Revoke token if revocation URL is provided
      if (config.revocationUrl && session) {
        fetch(config.revocationUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: session.accessToken,
            token_type_hint: 'access_token',
            client_id: config.clientId,
            client_secret: config.clientSecret,
          }),
        }).catch(console.error);
      }
      
      userSessions.delete(sessionId);
    }
    
    res.json({ success: true });
  });

  // Session check endpoint
  app.get('/auth/session', (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId || !userSessions.has(sessionId)) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const session = userSessions.get(sessionId)!;
    
    if (session.expiresAt < new Date()) {
      userSessions.delete(sessionId);
      res.status(401).json({ authenticated: false });
      return;
    }

    res.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
      },
      expiresAt: session.expiresAt,
    });
  });
}

// Helper functions
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Middleware to check authentication for MCP endpoints
export function requireAuth(req: any, res: any, next: any) {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId || !userSessions.has(sessionId)) {
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Authentication required',
      },
      id: null,
    });
    return;
  }

  const session = userSessions.get(sessionId)!;
  
  if (session.expiresAt < new Date()) {
    userSessions.delete(sessionId);
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Session expired',
      },
      id: null,
    });
    return;
  }

  // Add user info to request
  req.user = {
    id: session.userId,
    email: session.email,
    sessionId,
  };

  next();
}