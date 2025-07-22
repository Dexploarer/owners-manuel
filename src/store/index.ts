import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Project,
  Template,
  Document,
  User,
  GitHubRepository,
  TeamWorkspace,
  ProjectWorkspace,
  WorkspaceItem,
} from '@/types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Projects state
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;

  // Templates state
  templates: Template[];
  selectedTemplates: string[];
  setTemplates: (templates: Template[]) => void;
  setSelectedTemplates: (templateIds: string[]) => void;
  addSelectedTemplate: (templateId: string) => void;
  removeSelectedTemplate: (templateId: string) => void;

  // Documents state
  documents: Document[];
  currentDocument: Document | null;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;

  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generationError: string | null;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  setGenerationError: (error: string | null) => void;

  // GitHub Integration state
  connectedRepositories: GitHubRepository[];
  selectedRepository: GitHubRepository | null;
  setConnectedRepositories: (repositories: GitHubRepository[]) => void;
  setSelectedRepository: (repository: GitHubRepository | null) => void;

  // Team Workspace state
  currentWorkspace: TeamWorkspace | null;
  workspaces: TeamWorkspace[];
  setCurrentWorkspace: (workspace: TeamWorkspace | null) => void;
  setWorkspaces: (workspaces: TeamWorkspace[]) => void;

  // Project workspaces state
  projectWorkspaces: ProjectWorkspace[];
  currentProjectWorkspace: ProjectWorkspace | null;
  setProjectWorkspaces: (workspaces: ProjectWorkspace[]) => void;
  setCurrentProjectWorkspace: (workspace: ProjectWorkspace | null) => void;
  addProjectWorkspace: (workspace: ProjectWorkspace) => void;
  updateProjectWorkspace: (
    id: string,
    updates: Partial<ProjectWorkspace>
  ) => void;
  updateWorkspaceItem: (
    workspaceId: string,
    itemId: string,
    updates: Partial<WorkspaceItem>
  ) => void;
  moveWorkspaceItem: (
    workspaceId: string,
    itemId: string,
    newPhaseId: string,
    newPosition?: number
  ) => void;

  // UI state
  sidebarOpen: boolean;
  currentView:
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
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, _get) => ({
      // User state
      user: null,
      setUser: user => set({ user }, false, 'setUser'),

      // Projects state
      projects: [],
      currentProject: null,
      setProjects: projects => set({ projects }, false, 'setProjects'),
      setCurrentProject: project =>
        set({ currentProject: project }, false, 'setCurrentProject'),
      addProject: project =>
        set(
          state => ({ projects: [...state.projects, project] }),
          false,
          'addProject'
        ),
      updateProject: (id, updates) =>
        set(
          state => ({
            projects: state.projects.map(p =>
              p.id === id ? { ...p, ...updates } : p
            ),
            currentProject:
              state.currentProject?.id === id
                ? { ...state.currentProject, ...updates }
                : state.currentProject,
          }),
          false,
          'updateProject'
        ),

      // Templates state
      templates: [],
      selectedTemplates: [],
      setTemplates: templates => set({ templates }, false, 'setTemplates'),
      setSelectedTemplates: templateIds =>
        set({ selectedTemplates: templateIds }, false, 'setSelectedTemplates'),
      addSelectedTemplate: templateId =>
        set(
          state => ({
            selectedTemplates: state.selectedTemplates.includes(templateId)
              ? state.selectedTemplates
              : [...state.selectedTemplates, templateId],
          }),
          false,
          'addSelectedTemplate'
        ),
      removeSelectedTemplate: templateId =>
        set(
          state => ({
            selectedTemplates: state.selectedTemplates.filter(
              id => id !== templateId
            ),
          }),
          false,
          'removeSelectedTemplate'
        ),

      // Documents state
      documents: [],
      currentDocument: null,
      setDocuments: documents => set({ documents }, false, 'setDocuments'),
      setCurrentDocument: document =>
        set({ currentDocument: document }, false, 'setCurrentDocument'),
      addDocument: document =>
        set(
          state => ({ documents: [...state.documents, document] }),
          false,
          'addDocument'
        ),
      updateDocument: (id, updates) =>
        set(
          state => ({
            documents: state.documents.map(d =>
              d.id === id ? { ...d, ...updates } : d
            ),
            currentDocument:
              state.currentDocument?.id === id
                ? { ...state.currentDocument, ...updates }
                : state.currentDocument,
          }),
          false,
          'updateDocument'
        ),

      // Generation state
      isGenerating: false,
      generationProgress: 0,
      generationError: null,
      setGenerating: isGenerating =>
        set({ isGenerating }, false, 'setGenerating'),
      setGenerationProgress: progress =>
        set({ generationProgress: progress }, false, 'setGenerationProgress'),
      setGenerationError: error =>
        set({ generationError: error }, false, 'setGenerationError'),

      // GitHub Integration state
      connectedRepositories: [],
      selectedRepository: null,
      setConnectedRepositories: repositories =>
        set(
          { connectedRepositories: repositories },
          false,
          'setConnectedRepositories'
        ),
      setSelectedRepository: repository =>
        set({ selectedRepository: repository }, false, 'setSelectedRepository'),

      // Team Workspace state
      currentWorkspace: null,
      workspaces: [],
      setCurrentWorkspace: workspace =>
        set({ currentWorkspace: workspace }, false, 'setCurrentWorkspace'),
      setWorkspaces: workspaces => set({ workspaces }, false, 'setWorkspaces'),

      // Project workspaces state
      projectWorkspaces: [],
      currentProjectWorkspace: null,
      setProjectWorkspaces: workspaces =>
        set({ projectWorkspaces: workspaces }, false, 'setProjectWorkspaces'),
      setCurrentProjectWorkspace: workspace =>
        set(
          { currentProjectWorkspace: workspace },
          false,
          'setCurrentProjectWorkspace'
        ),
      addProjectWorkspace: workspace =>
        set(
          state => ({
            projectWorkspaces: [...state.projectWorkspaces, workspace],
          }),
          false,
          'addProjectWorkspace'
        ),
      updateProjectWorkspace: (id, updates) =>
        set(
          state => ({
            projectWorkspaces: state.projectWorkspaces.map(workspace =>
              workspace.id === id ? { ...workspace, ...updates } : workspace
            ),
            currentProjectWorkspace:
              state.currentProjectWorkspace?.id === id
                ? { ...state.currentProjectWorkspace, ...updates }
                : state.currentProjectWorkspace,
          }),
          false,
          'updateProjectWorkspace'
        ),
      updateWorkspaceItem: (workspaceId, itemId, updates) =>
        set(
          state => ({
            projectWorkspaces: state.projectWorkspaces.map(workspace => {
              if (workspace.id !== workspaceId) return workspace;
              return {
                ...workspace,
                phases: workspace.phases.map(phase => ({
                  ...phase,
                  items: phase.items.map(item =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                })),
              };
            }),
          }),
          false,
          'updateWorkspaceItem'
        ),
      moveWorkspaceItem: (workspaceId, itemId, newPhaseId, newPosition) =>
        set(
          state => ({
            projectWorkspaces: state.projectWorkspaces.map(workspace => {
              if (workspace.id !== workspaceId) return workspace;

              let itemToMove: WorkspaceItem | undefined;
              const newPhases = workspace.phases.map(phase => {
                const items = phase.items.filter(item => {
                  if (item.id === itemId) {
                    itemToMove = item;
                    return false;
                  }
                  return true;
                });
                return { ...phase, items };
              });

              if (itemToMove) {
                const targetPhaseIndex = newPhases.findIndex(
                  p => p.id === newPhaseId
                );
                if (targetPhaseIndex !== -1) {
                  const updatedItem = { ...itemToMove, phase_id: newPhaseId };
                  const targetItems = [...newPhases[targetPhaseIndex].items];

                  if (newPosition !== undefined) {
                    targetItems.splice(newPosition, 0, updatedItem);
                  } else {
                    targetItems.push(updatedItem);
                  }

                  newPhases[targetPhaseIndex] = {
                    ...newPhases[targetPhaseIndex],
                    items: targetItems.map((item, index) => ({
                      ...item,
                      position: index,
                    })),
                  };
                }
              }

              return { ...workspace, phases: newPhases };
            }),
          }),
          false,
          'moveWorkspaceItem'
        ),

      // UI state
      sidebarOpen: true,
      currentView: 'dashboard',
      setSidebarOpen: open =>
        set({ sidebarOpen: open }, false, 'setSidebarOpen'),
      setCurrentView: view =>
        set({ currentView: view }, false, 'setCurrentView'),
    }),
    {
      name: 'user-manual-store',
    }
  )
);

// Selectors for computed values
export const useCurrentProjectDocuments = (): Document[] => {
  const { documents, currentProject } = useAppStore();
  return documents.filter(doc => doc.projectId === currentProject?.id);
};

export const useSelectedTemplatesData = (): Template[] => {
  const { templates, selectedTemplates } = useAppStore();
  return templates.filter(template => selectedTemplates.includes(template.id));
};
