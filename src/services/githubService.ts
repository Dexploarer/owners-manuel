import { Octokit } from '@octokit/rest';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language: string | null;
  topics: string[];
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: {
    name: string;
    color: string;
    description: string | null;
  }[];
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
  user: GitHubUser;
  assignees: GitHubUser[];
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  mergeable: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubComment {
  id: number;
  body: string;
  user: GitHubUser;
  html_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * GitHub Service - Handles GitHub API integration and repository management
 */
export class GitHubService {
  private static instance: GitHubService;
  private octokit: Octokit;

  private constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token || process.env['GITHUB_TOKEN'],
    });
  }

  public static getInstance(token?: string): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService(token);
    }
    return GitHubService.instance;
  }

  /**
   * Get authenticated user information
   */
  public async getAuthenticatedUser(): Promise<GitHubUser> {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return {
      id: data.id,
      login: data.login,
      name: data.name,
      email: data.email,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
    };
  }

  /**
   * List user repositories
   */
  public async getUserRepositories(): Promise<GitHubRepository[]> {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      language: repo.language,
      topics: repo.topics || [],
      private: repo.private,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }));
  }

  /**
   * Get repository information
   */
  public async getRepository(
    owner: string,
    repo: string
  ): Promise<GitHubRepository> {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      html_url: data.html_url,
      clone_url: data.clone_url,
      ssh_url: data.ssh_url,
      default_branch: data.default_branch,
      language: data.language,
      topics: data.topics || [],
      private: data.private,
      owner: {
        login: data.owner.login,
        avatar_url: data.owner.avatar_url,
      },
    };
  }

  /**
   * List repository issues
   */
  public async getRepositoryIssues(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubIssue[]> {
    const { data } = await this.octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: 100,
    });

    return data
      .filter(issue => !issue.pull_request) // Exclude pull requests
      .map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body ?? null,
        state: issue.state as 'open' | 'closed',
        html_url: issue.html_url,
        user: {
          id: issue.user?.id ?? 0,
          login: issue.user?.login ?? '',
          name: issue.user?.name ?? null,
          email: issue.user?.email ?? null,
          avatar_url: issue.user?.avatar_url ?? '',
          html_url: issue.user?.html_url ?? '',
        },
        assignees:
          issue.assignees?.map(assignee => ({
            id: assignee.id,
            login: assignee.login,
            name: assignee.name ?? null,
            email: assignee.email ?? null,
            avatar_url: assignee.avatar_url,
            html_url: assignee.html_url,
          })) ?? [],
        labels: issue.labels.map(label => ({
          name: typeof label === 'string' ? label : (label.name ?? ''),
          color: typeof label === 'string' ? '' : (label.color ?? ''),
          description:
            typeof label === 'string' ? null : (label.description ?? null),
        })),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      }));
  }

  /**
   * List repository pull requests
   */
  public async getRepositoryPullRequests(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<GitHubPullRequest[]> {
    const { data } = await this.octokit.rest.pulls.list({
      owner,
      repo,
      state,
      per_page: 100,
    });

    return data.map(pr => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body ?? null,
      state: pr.state as 'open' | 'closed' | 'merged',
      html_url: pr.html_url,
      user: {
        id: pr.user?.id ?? 0,
        login: pr.user?.login ?? '',
        name: pr.user?.name ?? null,
        email: pr.user?.email ?? null,
        avatar_url: pr.user?.avatar_url ?? '',
        html_url: pr.user?.html_url ?? '',
      },
      assignees:
        pr.assignees?.map(assignee => ({
          id: assignee.id,
          login: assignee.login,
          name: assignee.name ?? null,
          email: assignee.email ?? null,
          avatar_url: assignee.avatar_url,
          html_url: assignee.html_url,
        })) ?? [],
      head: {
        ref: pr.head.ref,
        sha: pr.head.sha,
      },
      base: {
        ref: pr.base.ref,
        sha: pr.base.sha,
      },
      mergeable: 'mergeable' in pr ? (pr.mergeable as boolean | null) : null,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
    }));
  }

  /**
   * Get issue comments
   */
  public async getIssueComments(
    owner: string,
    repo: string,
    issue_number: number
  ): Promise<GitHubComment[]> {
    const { data } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number,
    });

    return data.map(comment => ({
      id: comment.id,
      body: comment.body ?? '',
      user: {
        id: comment.user?.id ?? 0,
        login: comment.user?.login ?? '',
        name: comment.user?.name ?? null,
        email: comment.user?.email ?? null,
        avatar_url: comment.user?.avatar_url ?? '',
        html_url: comment.user?.html_url ?? '',
      },
      html_url: comment.html_url,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    }));
  }

  /**
   * Create an issue comment
   */
  public async createIssueComment(
    owner: string,
    repo: string,
    issue_number: number,
    body: string
  ): Promise<GitHubComment> {
    const { data } = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body,
    });

    return {
      id: data.id,
      body: data.body ?? '',
      user: {
        id: data.user?.id ?? 0,
        login: data.user?.login ?? '',
        name: data.user?.name ?? null,
        email: data.user?.email ?? null,
        avatar_url: data.user?.avatar_url ?? '',
        html_url: data.user?.html_url ?? '',
      },
      html_url: data.html_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Create a pull request review comment
   */
  public async createPullRequestReviewComment(
    owner: string,
    repo: string,
    pull_number: number,
    body: string,
    commit_sha: string,
    path: string,
    line: number
  ): Promise<GitHubComment> {
    const { data } = await this.octokit.rest.pulls.createReviewComment({
      owner,
      repo,
      pull_number,
      body,
      commit_id: commit_sha,
      path,
      line,
    });

    return {
      id: data.id,
      body: data.body ?? '',
      user: {
        id: data.user?.id ?? 0,
        login: data.user?.login ?? '',
        name: data.user?.name ?? null,
        email: data.user?.email ?? null,
        avatar_url: data.user?.avatar_url ?? '',
        html_url: data.user?.html_url ?? '',
      },
      html_url: data.html_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Create a file in the repository
   */
  public async createFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    branch?: string
  ): Promise<void> {
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
      ...(branch && { branch }),
    });
  }

  /**
   * Update a file in the repository
   */
  public async updateFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    content: string,
    sha: string,
    branch?: string
  ): Promise<void> {
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
      sha,
      ...(branch && { branch }),
    });
  }

  /**
   * Get file contents from repository
   */
  public async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch?: string
  ): Promise<{ content: string; sha: string }> {
    const { data } = await this.octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ...(branch && { ref: branch }),
    });

    if ('content' in data) {
      return {
        content: Buffer.from(data.content, 'base64').toString('utf-8'),
        sha: data.sha,
      };
    }

    throw new Error('File not found or is a directory');
  }

  /**
   * Create a new branch
   */
  public async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    fromBranch = 'main'
  ): Promise<void> {
    // Get the SHA of the source branch
    const { data: refData } = await this.octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`,
    });

    // Create new branch
    await this.octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });
  }

  /**
   * Create a pull request
   */
  public async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base = 'main'
  ): Promise<GitHubPullRequest> {
    const { data } = await this.octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });

    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body ?? '',
      state: data.state as 'open' | 'closed' | 'merged',
      html_url: data.html_url,
      user: {
        id: data.user?.id ?? 0,
        login: data.user?.login ?? '',
        name: data.user?.name ?? null,
        email: data.user?.email ?? null,
        avatar_url: data.user?.avatar_url ?? '',
        html_url: data.user?.html_url ?? '',
      },
      assignees:
        data.assignees?.map(assignee => ({
          id: assignee.id,
          login: assignee.login,
          name: assignee.name ?? null,
          email: assignee.email ?? null,
          avatar_url: assignee.avatar_url,
          html_url: assignee.html_url,
        })) ?? [],
      head: {
        ref: data.head.ref,
        sha: data.head.sha,
      },
      base: {
        ref: data.base.ref,
        sha: data.base.sha,
      },
      mergeable: data.mergeable,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  /**
   * Check if the GitHub token is valid
   */
  public async validateToken(): Promise<boolean> {
    try {
      await this.octokit.rest.users.getAuthenticated();
      return true;
    } catch (error) {
      console.error('GitHub token validation failed:', error);
      return false;
    }
  }

  /**
   * Check if @claude was mentioned in text
   */
  public static isClaudeMentioned(text: string): boolean {
    return /@claude\b/i.test(text);
  }

  /**
   * Parse repository URL to extract owner and repo
   */
  public static parseRepositoryUrl(
    url: string
  ): { owner: string; repo: string } | null {
    const match = /github\.com[/:]([^/]+)\/([^/.]+)/.exec(url);
    if (match) {
      return {
        owner: match[1] ?? '',
        repo: match[2] ?? '',
      };
    }
    return null;
  }
}
