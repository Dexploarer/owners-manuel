# User Manual Platform

An AI-powered documentation generator for coding agents built with modern web technologies.

## Features

- 🤖 AI-powered documentation generation using Claude
- 🔐 OAuth 2.0 authentication (GitHub by default)
- 🌐 Model Context Protocol (MCP) server architecture
- 📚 Up-to-date library documentation via Context7 MCP
- 🎨 Modern UI with Tailwind CSS v4 and shadcn/ui
- ⚡ Fast runtime with Bun

## Tech Stack

- **Runtime**: Bun (NOT Node.js)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: Zustand
- **AI Integration**: Anthropic Claude 4 API with MCP support
- **Architecture**: MCP server with browser-compatible client

## Getting Started

### Prerequisites

- Bun v1.2.16 or later
- Anthropic API key
- GitHub OAuth app (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Dexploarer/owners-manuel.git
cd owners-manuel
```

2. Install dependencies:
```bash
bun install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - `ANTHROPIC_API_KEY` - Your Anthropic API key
   - GitHub OAuth credentials (see OAuth Setup below)

### Development

Start both the main app and MCP server:

```bash
bun run dev:all
```

Or run them separately:

```bash
# Terminal 1: Start MCP server (port 3001)
bun run mcp-server

# Terminal 2: Start main app (port 3000)
bun run dev
```

### Production

Build the application:

```bash
bun run build
```

Start for production:

```bash
bun start
```

## OAuth Setup

1. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Set Authorization callback URL to `http://localhost:3001/auth/callback`
   - Copy Client ID and Client Secret

2. Update `.env`:
```env
OAUTH_CLIENT_ID=your_github_client_id
OAUTH_CLIENT_SECRET=your_github_client_secret
```

## MCP Server Architecture

The platform uses Model Context Protocol (MCP) for browser compatibility:

- **MCP Server** (`src/server/mcp-claude-server.ts`): Express server with Streamable HTTP transport
- **OAuth Provider** (`src/server/auth/oauth-provider.ts`): Handles GitHub authentication
- **Browser Client** (`src/services/mcpClaudeClient.ts`): MCP client for browser environment

### Available MCP Tools

1. `generate-documentation` - Generate AI-powered documentation
2. `create-agents-md` - Create AGENTS.md files
3. `create-cursor-rules` - Create .cursorrules files

## API Routes

- `GET /auth/login` - Initiate OAuth flow
- `GET /auth/callback` - OAuth callback
- `POST /auth/logout` - Logout
- `GET /auth/session` - Check auth status
- `POST /mcp` - MCP protocol endpoint
- `GET /health` - Health check

## Scripts

- `bun run dev` - Start development server
- `bun run mcp-server` - Start MCP server
- `bun run dev:all` - Start both servers
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run type-check` - Run TypeScript checks
- `bun run test` - Run tests

## License

MIT
