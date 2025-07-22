import React, { useState, useEffect } from 'react';
import {
  Github,
  Settings,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
  GitBranch,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store';
import { GitHubService } from '@/services/githubService';
import type { GitHubRepository, GitHubUserProfile } from '@/types';

interface GitHubIntegrationProps {
  onRepositorySelected?: (repository: GitHubRepository) => void;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  onRepositorySelected,
}) => {
  const { user, setUser } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(
    null
  );
  const [githubToken, setGithubToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<GitHubUserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load GitHub user from localStorage if available
    const savedGitHubUser = localStorage.getItem('github-user');
    const savedToken = localStorage.getItem('github-token');

    if (savedGitHubUser && savedToken) {
      try {
        setGithubUser(JSON.parse(savedGitHubUser) as GitHubUserProfile);
        setGithubToken(savedToken);
        void loadRepositories(savedToken);
      } catch (error) {
        console.error('Failed to load saved GitHub data:', error);
        localStorage.removeItem('github-user');
        localStorage.removeItem('github-token');
      }
    }
  }, []);

  const loadRepositories = async (token: string): Promise<void> => {
    setLoading(true);
    try {
      const githubService = GitHubService.getInstance(token);
      const repos = await githubService.getUserRepositories();
      setRepositories(repos);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load repositories';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGitHub = async (): Promise<void> => {
    if (!githubToken.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const githubService = GitHubService.getInstance(githubToken);

      // Validate token by fetching user info
      const authenticatedUser = await githubService.getAuthenticatedUser();

      // Create GitHub user profile
      const profile: GitHubUserProfile = {
        id: authenticatedUser.id,
        login: authenticatedUser.login,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        avatar_url: authenticatedUser.avatar_url,
        html_url: authenticatedUser.html_url,
        connected_at: new Date(),
        access_token: githubToken, // In real app, this would be encrypted
        scopes: ['repo', 'user'], // These would come from the actual OAuth flow
      };

      // Update user with GitHub profile
      if (user) {
        const updatedUser = {
          ...user,
          github: profile,
        };
        setUser(updatedUser);
      }

      setGithubUser(profile);

      // Save to localStorage (in production, use secure storage)
      localStorage.setItem('github-user', JSON.stringify(profile));
      localStorage.setItem('github-token', githubToken);

      // Load repositories
      await loadRepositories(githubToken);

      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect to GitHub';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGitHub = (): void => {
    setGithubUser(null);
    setRepositories([]);
    setSelectedRepo(null);
    setGithubToken('');
    setError(null);

    // Clear localStorage
    localStorage.removeItem('github-user');
    localStorage.removeItem('github-token');

    // Update user
    if (user) {
      const updatedUser = { ...user };
      delete updatedUser.github;
      setUser(updatedUser);
    }
  };

  const handleSelectRepository = (repo: GitHubRepository): void => {
    setSelectedRepo(repo);
    if (onRepositorySelected) {
      onRepositorySelected(repo);
    }
  };

  const getClaudeActionsWorkflow = (repo: GitHubRepository): string => {
    return `name: Claude Assistant
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-response:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write
    steps:
      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          github_token: \${{ secrets.GITHUB_TOKEN }}
          # Optional: customize trigger phrase (default: @claude)
          trigger_phrase: "@claude"
          # Optional: limit conversation turns
          max_turns: "5"
          # Optional: specify model
          model: "claude-3-5-sonnet-20241022"
          # Optional: custom instructions
          custom_instructions: |
            You are a helpful AI assistant for the ${repo.name} project.
            When making changes, follow the existing code style and patterns.
            Always ensure changes are well-tested and documented.`;
  };

  if (!githubUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Github className='mr-2 h-5 w-5' />
            Connect GitHub
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Connect your GitHub account to enable @claude commands, automatic
            rule generation, and team collaboration features.
          </p>

          <div className='space-y-2'>
            <Label htmlFor='github-token'>GitHub Personal Access Token</Label>
            <Input
              id='github-token'
              type='password'
              placeholder='ghp_xxxxxxxxxxxxxxxxxxxx'
              value={githubToken}
              onChange={e => setGithubToken(e.target.value)}
              className='font-mono text-sm'
            />
            <p className='text-xs text-muted-foreground'>
              Create a token at{' '}
              <a
                href='https://github.com/settings/personal-access-tokens/new'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                GitHub Settings
              </a>{' '}
              with 'repo' and 'user' scopes
            </p>
          </div>

          {error && (
            <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
              <div className='flex items-center'>
                <AlertCircle className='h-4 w-4 text-destructive mr-2' />
                <p className='text-sm text-destructive'>{error}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleConnectGitHub}
            disabled={isConnecting || !githubToken.trim()}
            className='w-full'
          >
            {isConnecting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Github className='mr-2 h-4 w-4' />
            )}
            Connect GitHub
          </Button>

          <div className='space-y-3 pt-4 border-t'>
            <h4 className='text-sm font-medium'>What you'll get:</h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li className='flex items-center'>
                <Check className='mr-2 h-3 w-3 text-green-600' />
                @claude commands in issues and PRs
              </li>
              <li className='flex items-center'>
                <Check className='mr-2 h-3 w-3 text-green-600' />
                Automatic rule generation (CLAUDE.md, .cursorrules)
              </li>
              <li className='flex items-center'>
                <Check className='mr-2 h-3 w-3 text-green-600' />
                GitHub Actions workflow templates
              </li>
              <li className='flex items-center'>
                <Check className='mr-2 h-3 w-3 text-green-600' />
                Team collaboration features
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Connected User Info */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center'>
              <Github className='mr-2 h-5 w-5 text-green-600' />
              GitHub Connected
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleDisconnectGitHub}
            >
              <X className='mr-1 h-3 w-3' />
              Disconnect
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-3'>
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              className='w-10 h-10 rounded-full'
            />
            <div>
              <p className='font-medium'>
                {githubUser.name || githubUser.login}
              </p>
              <a
                href={githubUser.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-muted-foreground hover:text-primary flex items-center'
              >
                @{githubUser.login}
                <ExternalLink className='ml-1 h-3 w-3' />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repository Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Select Repository</span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => loadRepositories(githubToken)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                'Refresh'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin' />
              <span className='ml-2'>Loading repositories...</span>
            </div>
          ) : repositories.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              <BookOpen className='mx-auto h-12 w-12 mb-4 opacity-50' />
              <p>No repositories found</p>
            </div>
          ) : (
            <div className='space-y-2 max-h-80 overflow-y-auto'>
              {repositories.map(repo => (
                <div
                  key={repo.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedRepo?.id === repo.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectRepository(repo)}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <h3 className='font-medium'>{repo.name}</h3>
                        {repo.private && (
                          <span className='px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded'>
                            Private
                          </span>
                        )}
                        {repo.language && (
                          <span className='px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded'>
                            {repo.language}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className='text-sm text-muted-foreground mt-1'>
                          {repo.description}
                        </p>
                      )}
                      <div className='flex items-center space-x-4 mt-2 text-xs text-muted-foreground'>
                        <div className='flex items-center'>
                          <GitBranch className='mr-1 h-3 w-3' />
                          {repo.default_branch}
                        </div>
                        <a
                          href={repo.html_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='hover:text-primary flex items-center'
                          onClick={e => e.stopPropagation()}
                        >
                          View on GitHub
                          <ExternalLink className='ml-1 h-3 w-3' />
                        </a>
                      </div>
                    </div>
                    {selectedRepo?.id === repo.id && (
                      <Check className='h-5 w-5 text-primary flex-shrink-0' />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {selectedRepo && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Settings className='mr-2 h-5 w-5' />
              Setup Claude GitHub Actions
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              To enable @claude commands in your repository, follow these steps:
            </p>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  1. Add Repository Secrets
                </h4>
                <p className='text-xs text-muted-foreground'>
                  Go to your repository → Settings → Secrets and variables →
                  Actions
                </p>
                <ul className='text-xs space-y-1 ml-4'>
                  <li>
                    •{' '}
                    <code className='bg-secondary px-1 rounded'>
                      ANTHROPIC_API_KEY
                    </code>{' '}
                    - Your Anthropic API key
                  </li>
                </ul>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  2. Create GitHub Workflow
                </h4>
                <p className='text-xs text-muted-foreground'>
                  Create{' '}
                  <code className='bg-secondary px-1 rounded'>
                    .github/workflows/claude.yml
                  </code>{' '}
                  in your repository:
                </p>
                <div className='relative'>
                  <pre className='bg-secondary p-3 rounded-lg text-xs overflow-x-auto'>
                    <code>{getClaudeActionsWorkflow(selectedRepo)}</code>
                  </pre>
                  <Button
                    size='sm'
                    variant='outline'
                    className='absolute top-2 right-2'
                    onClick={() =>
                      navigator.clipboard.writeText(
                        getClaudeActionsWorkflow(selectedRepo)
                      )
                    }
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>3. Start Using @claude</h4>
                <p className='text-xs text-muted-foreground'>
                  You can now mention @claude in:
                </p>
                <ul className='text-xs space-y-1 ml-4'>
                  <li>• Issue comments</li>
                  <li>• Pull request comments</li>
                  <li>• Pull request reviews</li>
                  <li>• New issues (automatically triggers)</li>
                </ul>
              </div>
            </div>

            <div className='pt-4 border-t'>
              <h4 className='text-sm font-medium mb-2'>Example Commands:</h4>
              <ul className='space-y-1 text-xs font-mono bg-secondary p-2 rounded'>
                <li>@claude review this code</li>
                <li>@claude fix the bug in components/Header.tsx</li>
                <li>@claude generate tests for this function</li>
                <li>@claude update the documentation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
