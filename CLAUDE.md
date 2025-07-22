# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the User Manual platform - an AI-powered documentation generator for coding agents built with:
- **Runtime**: Bun (NOT Node.js)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: Zustand with devtools
- **AI Integration**: Anthropic Claude 4 API with MCP (Model Context Protocol) support
- **MCP Integration**: Context7 server for up-to-date library documentation
- **Build System**: Custom Bun-based build script

## Development Commands

```bash
# Start development server with hot reload
bun dev
# or
bun --hot src/index.tsx

# Build for production
bun run build

# Start production server
bun start
# or
NODE_ENV=production bun src/index.tsx

# Install dependencies
bun install

# Add new dependencies
bun add [package-name]
```

## Project Structure

- `src/` - Main application code
  - `index.tsx` - Bun server with API routes and HTML serving
  - `index.html` - Main HTML entry point
  - `styles.css` - Tailwind CSS imports and custom styles
  - `app.tsx` - Root React component
  - `components/` - React components
    - `ui/` - shadcn/ui components
  - `lib/` - Utility functions
- `build.ts` - Custom build script with advanced configuration

## Key Technical Details

### Server Architecture
The application runs on Bun's built-in server (src/index.tsx) which:
- Serves the React app for all non-API routes
- Handles API routes directly (e.g., `/api/hello`)
- Supports dynamic route parameters (e.g., `/api/hello/:name`)
- Echoes browser console logs to server in development

### Build System
The custom build script (build.ts) features:
- Automatic HTML entry point detection
- Tailwind CSS plugin integration via bun-plugin-tailwind
- Production optimizations (minification, sourcemaps)
- Flexible CLI configuration with magical argument parsing

### Styling Approach
- Uses Tailwind CSS v4's new approach (import in CSS, not config file)
- CSS custom properties for theming
- shadcn/ui components with class-variance-authority
- Dark mode support built-in

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- JSX: react-jsx (no import React needed)
- No emit - Bun handles transpilation

## Adding New Features

### API Routes
Add new routes in `src/index.tsx`:
```typescript
if (url.pathname === "/api/your-route") {
  return new Response(JSON.stringify({ data: "value" }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

### Components
1. For shadcn/ui components: Use the component files in `src/components/ui/`
2. For new components: Create in `src/components/`
3. Always use the `cn()` utility for className merging

### Styling
- Import Tailwind classes directly
- Use CSS custom properties defined in styles.css for theming
- Follow existing patterns for dark mode support

## MCP (Model Context Protocol) Integration

The platform integrates with Context7 MCP server to provide up-to-date library documentation:

### Features
- **Automatic Library Resolution**: Resolves tech stack libraries to Context7-compatible IDs
- **Up-to-Date Documentation**: Fetches current documentation and code examples
- **Version-Specific Guidance**: Ensures documentation matches library versions
- **Batch Processing**: Efficiently processes multiple libraries
- **Security Compliance**: Follows July 2025 MCP security best practices

### Key Files
- `src/services/mcpClient.ts` - MCP client implementation
- `src/services/claude.ts` - Enhanced with MCP context integration
- `src/components/MCPStatus.tsx` - Connection status monitoring

### Usage
The MCP integration automatically enhances document generation by:
1. Analyzing project tech stack
2. Fetching relevant library documentation
3. Injecting up-to-date context into AI prompts
4. Providing version-specific recommendations

## Environment Configuration

Copy `.env.example` to `.env` and configure:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Important Notes

1. **Bun-specific**: This project uses Bun's APIs - don't use Node.js-specific modules
2. **React 19**: Uses latest React features - no legacy patterns
3. **Type Safety**: Always maintain TypeScript types, avoid `any`
4. **Build Process**: The build.ts script is sophisticated - understand it before modifying
5. **Hot Reload**: Development server includes HMR - changes reflect immediately
6. **MCP Integration**: Enhanced document generation with real-time library documentation