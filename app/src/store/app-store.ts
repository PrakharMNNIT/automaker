import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/lib/electron";

export type ViewMode = "welcome" | "spec" | "board" | "code" | "agent" | "settings" | "analysis" | "tools";
export type ThemeMode = "light" | "dark" | "system";

export interface ApiKeys {
  anthropic: string;
  google: string;
}

export interface Feature {
  id: string;
  category: string;
  description: string;
  steps: string[];
  passes: boolean;
  status: "backlog" | "planned" | "in_progress" | "review" | "verified" | "failed";
}

export interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  size?: number;
  extension?: string;
}

export interface ProjectAnalysis {
  fileTree: FileTreeNode[];
  totalFiles: number;
  totalDirectories: number;
  filesByExtension: Record<string, number>;
  analyzedAt: string;
}

export interface AppState {
  // Project state
  projects: Project[];
  currentProject: Project | null;

  // View state
  currentView: ViewMode;
  sidebarOpen: boolean;

  // Theme
  theme: ThemeMode;

  // Features/Kanban
  features: Feature[];

  // App spec
  appSpec: string;

  // IPC status
  ipcConnected: boolean;

  // API Keys
  apiKeys: ApiKeys;

  // Project Analysis
  projectAnalysis: ProjectAnalysis | null;
  isAnalyzing: boolean;
}

export interface AppActions {
  // Project actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  setCurrentProject: (project: Project | null) => void;

  // View actions
  setCurrentView: (view: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme actions
  setTheme: (theme: ThemeMode) => void;

  // Feature actions
  setFeatures: (features: Feature[]) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  addFeature: (feature: Omit<Feature, "id">) => void;
  removeFeature: (id: string) => void;
  moveFeature: (id: string, newStatus: Feature["status"]) => void;

  // App spec actions
  setAppSpec: (spec: string) => void;

  // IPC actions
  setIpcConnected: (connected: boolean) => void;

  // API Keys actions
  setApiKeys: (keys: Partial<ApiKeys>) => void;

  // Analysis actions
  setProjectAnalysis: (analysis: ProjectAnalysis | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  clearAnalysis: () => void;

  // Reset
  reset: () => void;
}

const initialState: AppState = {
  projects: [],
  currentProject: null,
  currentView: "welcome",
  sidebarOpen: true,
  theme: "dark",
  features: [],
  appSpec: "",
  ipcConnected: false,
  apiKeys: {
    anthropic: "",
    google: "",
  },
  projectAnalysis: null,
  isAnalyzing: false,
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Project actions
      setProjects: (projects) => set({ projects }),

      addProject: (project) => {
        const projects = get().projects;
        const existing = projects.findIndex((p) => p.path === project.path);
        if (existing >= 0) {
          const updated = [...projects];
          updated[existing] = { ...project, lastOpened: new Date().toISOString() };
          set({ projects: updated });
        } else {
          set({
            projects: [...projects, { ...project, lastOpened: new Date().toISOString() }],
          });
        }
      },

      removeProject: (projectId) => {
        set({ projects: get().projects.filter((p) => p.id !== projectId) });
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
        if (project) {
          set({ currentView: "board" });
        } else {
          set({ currentView: "welcome" });
        }
      },

      // View actions
      setCurrentView: (view) => set({ currentView: view }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Feature actions
      setFeatures: (features) => set({ features }),

      updateFeature: (id, updates) => {
        set({
          features: get().features.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        });
      },

      addFeature: (feature) => {
        const id = `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        set({ features: [...get().features, { ...feature, id }] });
      },

      removeFeature: (id) => {
        set({ features: get().features.filter((f) => f.id !== id) });
      },

      moveFeature: (id, newStatus) => {
        set({
          features: get().features.map((f) =>
            f.id === id ? { ...f, status: newStatus } : f
          ),
        });
      },

      // App spec actions
      setAppSpec: (spec) => set({ appSpec: spec }),

      // IPC actions
      setIpcConnected: (connected) => set({ ipcConnected: connected }),

      // API Keys actions
      setApiKeys: (keys) => set({ apiKeys: { ...get().apiKeys, ...keys } }),

      // Analysis actions
      setProjectAnalysis: (analysis) => set({ projectAnalysis: analysis }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      clearAnalysis: () => set({ projectAnalysis: null, isAnalyzing: false }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "automaker-storage",
      partialize: (state) => ({
        projects: state.projects,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        apiKeys: state.apiKeys,
      }),
    }
  )
);
