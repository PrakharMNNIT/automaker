// Type definitions for Electron IPC API

export interface FileEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
}

export interface FileStats {
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  mtime: Date;
}

export interface DialogResult {
  canceled: boolean;
  filePaths: string[];
}

export interface FileResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface WriteResult {
  success: boolean;
  error?: string;
}

export interface ReaddirResult {
  success: boolean;
  entries?: FileEntry[];
  error?: string;
}

export interface StatResult {
  success: boolean;
  stats?: FileStats;
  error?: string;
}

export interface ElectronAPI {
  ping: () => Promise<string>;
  openDirectory: () => Promise<DialogResult>;
  openFile: (options?: object) => Promise<DialogResult>;
  readFile: (filePath: string) => Promise<FileResult>;
  writeFile: (filePath: string, content: string) => Promise<WriteResult>;
  mkdir: (dirPath: string) => Promise<WriteResult>;
  readdir: (dirPath: string) => Promise<ReaddirResult>;
  exists: (filePath: string) => Promise<boolean>;
  stat: (filePath: string) => Promise<StatResult>;
  getPath: (name: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    isElectron?: boolean;
  }
}

// Mock data for web development
const mockFeatures = [
  {
    category: "Core",
    description: "Sample Feature",
    steps: ["Step 1", "Step 2"],
    passes: false,
  },
];

// Local storage keys
const STORAGE_KEYS = {
  PROJECTS: "automaker_projects",
  CURRENT_PROJECT: "automaker_current_project",
} as const;

// Mock file system using localStorage
const mockFileSystem: Record<string, string> = {};

// Check if we're in Electron
export const isElectron = (): boolean => {
  return typeof window !== "undefined" && window.isElectron === true;
};

// Get the Electron API or a mock for web development
export const getElectronAPI = (): ElectronAPI => {
  if (isElectron() && window.electronAPI) {
    return window.electronAPI;
  }

  // Return mock API for web development
  return {
    ping: async () => "pong (mock)",

    openDirectory: async () => {
      // In web mode, we'll use a prompt to simulate directory selection
      const path = prompt("Enter project directory path:", "/Users/demo/project");
      return {
        canceled: !path,
        filePaths: path ? [path] : [],
      };
    },

    openFile: async () => {
      const path = prompt("Enter file path:");
      return {
        canceled: !path,
        filePaths: path ? [path] : [],
      };
    },

    readFile: async (filePath: string) => {
      // Check mock file system
      if (mockFileSystem[filePath]) {
        return { success: true, content: mockFileSystem[filePath] };
      }
      // Return mock data based on file type
      if (filePath.endsWith("feature_list.json")) {
        return { success: true, content: JSON.stringify(mockFeatures, null, 2) };
      }
      if (filePath.endsWith("app_spec.txt")) {
        return {
          success: true,
          content: "<project_specification>\n  <project_name>Demo Project</project_name>\n</project_specification>",
        };
      }
      return { success: false, error: "File not found (mock)" };
    },

    writeFile: async (filePath: string, content: string) => {
      mockFileSystem[filePath] = content;
      return { success: true };
    },

    mkdir: async () => {
      return { success: true };
    },

    readdir: async (dirPath: string) => {
      // Return mock directory structure based on path
      if (dirPath) {
        // Root level
        if (!dirPath.includes("/src") && !dirPath.includes("/tests") && !dirPath.includes("/public")) {
          return {
            success: true,
            entries: [
              { name: "src", isDirectory: true, isFile: false },
              { name: "tests", isDirectory: true, isFile: false },
              { name: "public", isDirectory: true, isFile: false },
              { name: "package.json", isDirectory: false, isFile: true },
              { name: "tsconfig.json", isDirectory: false, isFile: true },
              { name: "app_spec.txt", isDirectory: false, isFile: true },
              { name: "feature_list.json", isDirectory: false, isFile: true },
              { name: "README.md", isDirectory: false, isFile: true },
            ],
          };
        }
        // src directory
        if (dirPath.endsWith("/src")) {
          return {
            success: true,
            entries: [
              { name: "components", isDirectory: true, isFile: false },
              { name: "lib", isDirectory: true, isFile: false },
              { name: "app", isDirectory: true, isFile: false },
              { name: "index.ts", isDirectory: false, isFile: true },
              { name: "utils.ts", isDirectory: false, isFile: true },
            ],
          };
        }
        // src/components directory
        if (dirPath.endsWith("/components")) {
          return {
            success: true,
            entries: [
              { name: "Button.tsx", isDirectory: false, isFile: true },
              { name: "Card.tsx", isDirectory: false, isFile: true },
              { name: "Header.tsx", isDirectory: false, isFile: true },
              { name: "Footer.tsx", isDirectory: false, isFile: true },
            ],
          };
        }
        // src/lib directory
        if (dirPath.endsWith("/lib")) {
          return {
            success: true,
            entries: [
              { name: "api.ts", isDirectory: false, isFile: true },
              { name: "helpers.ts", isDirectory: false, isFile: true },
            ],
          };
        }
        // src/app directory
        if (dirPath.endsWith("/app")) {
          return {
            success: true,
            entries: [
              { name: "page.tsx", isDirectory: false, isFile: true },
              { name: "layout.tsx", isDirectory: false, isFile: true },
              { name: "globals.css", isDirectory: false, isFile: true },
            ],
          };
        }
        // tests directory
        if (dirPath.endsWith("/tests")) {
          return {
            success: true,
            entries: [
              { name: "unit.test.ts", isDirectory: false, isFile: true },
              { name: "e2e.spec.ts", isDirectory: false, isFile: true },
            ],
          };
        }
        // public directory
        if (dirPath.endsWith("/public")) {
          return {
            success: true,
            entries: [
              { name: "favicon.ico", isDirectory: false, isFile: true },
              { name: "logo.svg", isDirectory: false, isFile: true },
            ],
          };
        }
        // Default empty for other paths
        return { success: true, entries: [] };
      }
      return { success: true, entries: [] };
    },

    exists: async (filePath: string) => {
      return mockFileSystem[filePath] !== undefined ||
        filePath.endsWith("feature_list.json") ||
        filePath.endsWith("app_spec.txt");
    },

    stat: async () => {
      return {
        success: true,
        stats: {
          isDirectory: false,
          isFile: true,
          size: 1024,
          mtime: new Date(),
        },
      };
    },

    getPath: async (name: string) => {
      if (name === "userData") {
        return "/mock/userData";
      }
      return `/mock/${name}`;
    },
  };
};

// Utility functions for project management

export interface Project {
  id: string;
  name: string;
  path: string;
  lastOpened?: string;
}

export const getStoredProjects = (): Project[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveProjects = (projects: Project[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getCurrentProject = (): Project | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentProject = (project: Project | null): void => {
  if (typeof window === "undefined") return;
  if (project) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, JSON.stringify(project));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
  }
};

export const addProject = (project: Project): void => {
  const projects = getStoredProjects();
  const existing = projects.findIndex((p) => p.path === project.path);
  if (existing >= 0) {
    projects[existing] = { ...project, lastOpened: new Date().toISOString() };
  } else {
    projects.push({ ...project, lastOpened: new Date().toISOString() });
  }
  saveProjects(projects);
};

export const removeProject = (projectId: string): void => {
  const projects = getStoredProjects().filter((p) => p.id !== projectId);
  saveProjects(projects);
};
