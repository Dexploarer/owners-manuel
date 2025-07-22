#!/usr/bin/env bun

import { spawn } from 'child_process';
import { resolve } from 'path';

const rootDir = resolve(__dirname, '..');

console.log('🚀 Starting development servers...\n');

// Start MCP server
const mcpServer = spawn('bun', ['run', 'src/server/mcp-claude-server.ts'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    MCP_PORT: '3001',
    CORS_ORIGIN: 'http://localhost:3000',
  },
});

// Give MCP server time to start
setTimeout(() => {
  // Start main app
  const mainApp = spawn('bun', ['--hot', 'src/index.tsx'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  });

  // Handle process termination
  const cleanup = () => {
    console.log('\n🛑 Shutting down servers...');
    mcpServer.kill();
    mainApp.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}, 2000);