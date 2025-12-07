"use client";

import { useCallback, useState } from "react";
import { useAppStore, FileTreeNode, ProjectAnalysis } from "@/store/app-store";
import { getElectronAPI } from "@/lib/electron";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  RefreshCw,
  BarChart3,
  FileCode,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".DS_Store",
  "*.log",
  ".cache",
  "coverage",
  "__pycache__",
  ".pytest_cache",
  ".venv",
  "venv",
  ".env",
];

const shouldIgnore = (name: string) => {
  return IGNORE_PATTERNS.some((pattern) => {
    if (pattern.startsWith("*")) {
      return name.endsWith(pattern.slice(1));
    }
    return name === pattern;
  });
};

const getExtension = (filename: string): string => {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
};

export function AnalysisView() {
  const {
    currentProject,
    projectAnalysis,
    isAnalyzing,
    setProjectAnalysis,
    setIsAnalyzing,
    clearAnalysis,
  } = useAppStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Recursively scan directory
  const scanDirectory = useCallback(
    async (path: string, depth: number = 0): Promise<FileTreeNode[]> => {
      if (depth > 10) return []; // Prevent infinite recursion

      const api = getElectronAPI();
      try {
        const result = await api.readdir(path);
        if (!result.success || !result.entries) return [];

        const nodes: FileTreeNode[] = [];
        const entries = result.entries.filter((e) => !shouldIgnore(e.name));

        for (const entry of entries) {
          const fullPath = `${path}/${entry.name}`;
          const node: FileTreeNode = {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory,
            extension: entry.isFile ? getExtension(entry.name) : undefined,
          };

          if (entry.isDirectory) {
            // Recursively scan subdirectories
            node.children = await scanDirectory(fullPath, depth + 1);
          }

          nodes.push(node);
        }

        // Sort: directories first, then files alphabetically
        nodes.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });

        return nodes;
      } catch (error) {
        console.error("Failed to scan directory:", path, error);
        return [];
      }
    },
    []
  );

  // Count files and directories
  const countNodes = (
    nodes: FileTreeNode[]
  ): { files: number; dirs: number; byExt: Record<string, number> } => {
    let files = 0;
    let dirs = 0;
    const byExt: Record<string, number> = {};

    const traverse = (items: FileTreeNode[]) => {
      for (const item of items) {
        if (item.isDirectory) {
          dirs++;
          if (item.children) traverse(item.children);
        } else {
          files++;
          if (item.extension) {
            byExt[item.extension] = (byExt[item.extension] || 0) + 1;
          } else {
            byExt["(no extension)"] = (byExt["(no extension)"] || 0) + 1;
          }
        }
      }
    };

    traverse(nodes);
    return { files, dirs, byExt };
  };

  // Run the analysis
  const runAnalysis = useCallback(async () => {
    if (!currentProject) return;

    setIsAnalyzing(true);
    clearAnalysis();

    try {
      const fileTree = await scanDirectory(currentProject.path);
      const counts = countNodes(fileTree);

      const analysis: ProjectAnalysis = {
        fileTree,
        totalFiles: counts.files,
        totalDirectories: counts.dirs,
        filesByExtension: counts.byExt,
        analyzedAt: new Date().toISOString(),
      };

      setProjectAnalysis(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentProject, setIsAnalyzing, clearAnalysis, scanDirectory, setProjectAnalysis]);

  // Toggle folder expansion
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (expandedFolders.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  // Render file tree node
  const renderNode = (node: FileTreeNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);

    return (
      <div key={node.path} data-testid={`analysis-node-${node.name}`}>
        <div
          className={cn(
            "flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 text-sm"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.isDirectory) {
              toggleFolder(node.path);
            }
          }}
        >
          {node.isDirectory ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-primary shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-4" />
              <File className="w-4 h-4 text-muted-foreground shrink-0" />
            </>
          )}
          <span className="truncate">{node.name}</span>
          {node.extension && (
            <span className="text-xs text-muted-foreground ml-auto">.{node.extension}</span>
          )}
        </div>
        {node.isDirectory && isExpanded && node.children && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="analysis-view-no-project">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="analysis-view">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold">Project Analysis</h1>
            <p className="text-sm text-muted-foreground">{currentProject.name}</p>
          </div>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          data-testid="analyze-project-button"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Analyze Project
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {!projectAnalysis && !isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Search className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Analysis Yet</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Click &quot;Analyze Project&quot; to scan your codebase and get insights about its
              structure.
            </p>
            <Button onClick={runAnalysis} data-testid="analyze-project-button-empty">
              <Search className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Scanning project files...</p>
          </div>
        ) : projectAnalysis ? (
          <div className="flex gap-4 h-full overflow-hidden">
            {/* Stats Panel */}
            <div className="w-80 shrink-0 overflow-y-auto space-y-4">
              <Card data-testid="analysis-stats">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Statistics
                  </CardTitle>
                  <CardDescription>
                    Analyzed {new Date(projectAnalysis.analyzedAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Files</span>
                    <span className="font-medium" data-testid="total-files">
                      {projectAnalysis.totalFiles}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Directories</span>
                    <span className="font-medium" data-testid="total-directories">
                      {projectAnalysis.totalDirectories}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="files-by-extension">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Files by Extension
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(projectAnalysis.filesByExtension)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 15)
                      .map(([ext, count]) => (
                        <div key={ext} className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-mono">
                            {ext.startsWith("(") ? ext : `.${ext}`}
                          </span>
                          <span>{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* File Tree */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  File Tree
                </CardTitle>
                <CardDescription>
                  {projectAnalysis.totalFiles} files in {projectAnalysis.totalDirectories}{" "}
                  directories
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-full" data-testid="analysis-file-tree">
                <div className="p-2">
                  {projectAnalysis.fileTree.map((node) => renderNode(node))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
