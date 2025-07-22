export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: TechStack[];
  team: TeamMember[];
  templates: Template[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TechStack {
  id: string;
  name: string;
  category: 'framework' | 'language' | 'database' | 'tool';
  version?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  framework: string;
  language: string;
  content: TemplateContent;
  variables: TemplateVariable[];
  usage: UsageStats;
  isCustom: boolean;
  createdBy?: string;
}

export type TemplateCategory =
  | 'agents-md'
  | 'cursor-rules'
  | 'workflow'
  | 'testing'
  | 'security'
  | 'performance';

export interface TemplateContent {
  sections: TemplateSection[];
  metadata: {
    version: string;
    lastUpdated: Date;
    compatibility: string[];
  };
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
}

export interface TemplateVariable {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'boolean' | 'array' | 'object';
  defaultValue?: string;
  required: boolean;
  options?: string[];
}

export interface UsageStats {
  totalUses: number;
  lastUsed: Date;
  successRate: number;
  avgGenerationTime: number;
}

export interface Document {
  id: string;
  projectId: string;
  type: DocumentType;
  title: string;
  content: string;
  version: number;
  generatedBy: AIModel;
  performance: PerformanceMetrics;
  feedback: UserFeedback[];
  status: 'draft' | 'review' | 'approved' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType =
  | 'AGENTS_MD'
  | 'CURSOR_RULES'
  | 'WORKFLOW'
  | 'TESTING'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'README';

export interface AIModel {
  provider: 'anthropic' | 'openai' | 'google';
  model: string;
  version: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
}

export interface PerformanceMetrics {
  generationTime: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  qualityScore: number;
  userSatisfaction: number;
}

export interface UserFeedback {
  id: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  suggestions?: string[];
  createdAt: Date;
}

export interface GenerationRequest {
  projectId: string;
  templateIds: string[];
  customPrompt?: string;
  variables: Record<string, unknown>;
  options: {
    includeComments: boolean;
    detailLevel: 'basic' | 'detailed' | 'comprehensive';
    outputFormat: 'markdown' | 'json' | 'yaml';
  };
}

export interface GenerationResult {
  documents: Document[];
  metadata: {
    totalTokens: number;
    generationTime: number;
    modelUsed: AIModel;
    success: boolean;
    errors?: string[];
    warnings?: string[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  usage: {
    documentsGenerated: number;
    tokensUsed: number;
    monthlyLimit: number;
    resetDate: Date;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultTemplate: string;
    notifications: {
      email: boolean;
      inApp: boolean;
    };
  };
  // GitHub integration
  github?: GitHubUserProfile;
}

// GitHub Integration Types
export interface GitHubUserProfile {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  connected_at: Date;
  access_token: string; // Encrypted/hashed
  scopes: string[];
}

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
  linked_at?: Date;
  webhook_configured?: boolean;
}

export interface ClaudeCommand {
  id: string;
  command: string;
  description: string;
  usage: string;
  examples: string[];
  category: 'generation' | 'review' | 'fix' | 'analysis';
  permissions_required: string[];
}

export interface GitHubIntegration {
  connected: boolean;
  user?: GitHubUserProfile;
  repositories: GitHubRepository[];
  selectedRepository?: GitHubRepository;
  webhook_url?: string;
  app_installation_id?: number;
}

export interface TeamWorkspace {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  members: TeamMember[];
  projects: Project[];
  github_integrations: GitHubIntegration[];
  shared_templates: Template[];
  permissions: {
    create_projects: boolean;
    manage_templates: boolean;
    invite_members: boolean;
    configure_github: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface ClaudeRuleTemplate {
  id: string;
  name: string;
  description: string;
  file_type: 'CLAUDE.md' | '.cursorrules' | 'AGENTS.md';
  content_template: string;
  variables: TemplateVariable[];
  applicable_tech_stacks: string[];
  usage_count: number;
  created_by: string;
  is_public: boolean;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

// GitHub Actions Integration
export interface GitHubAction {
  id: string;
  name: string;
  description: string;
  workflow_content: string;
  triggers: GitHubActionTrigger[];
  environment_variables: Record<string, string>;
  secrets_required: string[];
  permissions_required: string[];
  created_at: Date;
  updated_at: Date;
}

export interface GitHubActionTrigger {
  event: 'push' | 'pull_request' | 'issue_comment' | 'issues' | 'schedule';
  conditions?: Record<string, unknown>;
}

// Claude Code SDK Integration
export interface ClaudeCodeExecution {
  id: string;
  command: string;
  prompt: string;
  repository_id?: string;
  branch?: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: {
    messages: unknown[];
    files_changed: string[];
    commits_created: string[];
    duration: number;
  };
  error_message?: string;
  created_at: Date;
  completed_at?: Date;
}

// Workspace Management System
export interface WorkspacePhase {
  id: string;
  name: string;
  description?: string | undefined;
  color: string;
  position: number;
  wip_limit?: number | undefined;
  items: WorkspaceItem[];
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  description?: string | undefined;
  type: 'document' | 'rule' | 'task' | 'template';
  phase_id: string;
  position: number;
  content?: string | undefined;
  file_path?: string | undefined;
  document_type?: DocumentType | undefined;
  rule_type?: 'CLAUDE.md' | '.cursorrules' | 'AGENTS.md' | undefined;
  status: 'draft' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string | undefined;
  due_date?: Date | undefined;
  tags: string[];
  dependencies: string[];
  metadata: {
    created_by: string;
    file_size?: number | undefined;
    last_modified?: Date | undefined;
    version?: number | undefined;
  };
  created_at: Date;
  updated_at: Date;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  phases: WorkspacePhase[];
  template_id?: string;
  settings: WorkspaceSettings;
  collaborators: WorkspaceCollaborator[];
  activity: WorkspaceActivity[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceSettings {
  default_view: 'kanban' | 'list' | 'calendar';
  auto_advance: boolean;
  notifications_enabled: boolean;
  phase_templates_enabled: boolean;
  collaboration_mode: 'private' | 'team' | 'public';
  integration_settings: {
    github_sync: boolean;
    auto_generate_docs: boolean;
    mcp_enabled: boolean;
  };
}

export interface WorkspaceCollaborator {
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  permissions: {
    can_edit_phases: boolean;
    can_move_items: boolean;
    can_create_items: boolean;
    can_delete_items: boolean;
    can_invite_users: boolean;
  };
  joined_at: Date;
}

export interface WorkspaceActivity {
  id: string;
  type:
    | 'item_created'
    | 'item_moved'
    | 'phase_created'
    | 'user_joined'
    | 'comment_added';
  user_id: string;
  user_name: string;
  description: string;
  item_id?: string;
  phase_id?: string;
  old_phase_id?: string;
  new_phase_id?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'design' | 'marketing' | 'research' | 'custom';
  phases: Omit<WorkspacePhase, 'id' | 'items' | 'created_at' | 'updated_at'>[];
  default_items: Omit<
    WorkspaceItem,
    'id' | 'phase_id' | 'created_at' | 'updated_at'
  >[];
  tech_stacks: string[];
  usage_count: number;
  is_public: boolean;
  created_by: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface DragDropContext {
  activeItem: WorkspaceItem | null;
  overId: string | null;
  activePhase: WorkspacePhase | null;
}

export interface PhaseTransition {
  from_phase_id: string;
  to_phase_id: string;
  auto_actions?: {
    generate_documentation?: boolean;
    create_github_issue?: boolean;
    notify_team?: boolean;
    run_tests?: boolean;
  };
  required_fields?: string[];
  validation_rules?: string[];
}

export type ViewType =
  | 'dashboard'
  | 'projects'
  | 'templates'
  | 'documents'
  | 'generate'
  | 'github'
  | 'rules'
  | 'team'
  | 'workflows'
  | 'workspaces';
