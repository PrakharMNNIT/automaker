"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { getElectronAPI } from "@/lib/electron";
import { FolderOpen, Plus, Sparkles, Folder, Clock } from "lucide-react";

export function WelcomeView() {
  const { projects, addProject, setCurrentProject } = useAppStore();
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectPath, setNewProjectPath] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenProject = useCallback(async () => {
    const api = getElectronAPI();
    const result = await api.openDirectory();

    if (!result.canceled && result.filePaths[0]) {
      const path = result.filePaths[0];
      const name = path.split("/").pop() || "Untitled Project";

      const project = {
        id: `project-${Date.now()}`,
        name,
        path,
        lastOpened: new Date().toISOString(),
      };

      addProject(project);
      setCurrentProject(project);
    }
  }, [addProject, setCurrentProject]);

  const handleNewProject = () => {
    setNewProjectName("");
    setNewProjectPath("");
    setShowNewProjectDialog(true);
  };

  const handleSelectDirectory = async () => {
    const api = getElectronAPI();
    const result = await api.openDirectory();

    if (!result.canceled && result.filePaths[0]) {
      setNewProjectPath(result.filePaths[0]);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName || !newProjectPath) return;

    setIsCreating(true);
    try {
      const api = getElectronAPI();
      const projectPath = `${newProjectPath}/${newProjectName}`;

      // Create project directory
      await api.mkdir(projectPath);

      // Create initial files
      await api.writeFile(
        `${projectPath}/app_spec.txt`,
        `<project_specification>
  <project_name>${newProjectName}</project_name>

  <overview>
    Describe your project here...
  </overview>

  <technology_stack>
    <!-- Define your tech stack -->
  </technology_stack>

  <core_capabilities>
    <!-- List core features -->
  </core_capabilities>
</project_specification>`
      );

      await api.writeFile(
        `${projectPath}/feature_list.json`,
        JSON.stringify(
          [
            {
              category: "Core",
              description: "First feature to implement",
              steps: ["Step 1: Define requirements", "Step 2: Implement", "Step 3: Test"],
              passes: false,
            },
          ],
          null,
          2
        )
      );

      const project = {
        id: `project-${Date.now()}`,
        name: newProjectName,
        path: projectPath,
        lastOpened: new Date().toISOString(),
      };

      addProject(project);
      setCurrentProject(project);
      setShowNewProjectDialog(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const recentProjects = [...projects]
    .sort((a, b) => {
      const dateA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
      const dateB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8" data-testid="welcome-view">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to Automaker</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Your autonomous AI development studio. Build software with intelligent orchestration.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full mb-12">
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={handleNewProject}
          data-testid="new-project-card"
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>New Project</CardTitle>
            <CardDescription>
              Create a new project from scratch or use interactive mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" data-testid="create-new-project">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={handleOpenProject}
          data-testid="open-project-card"
        >
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Open Project</CardTitle>
            <CardDescription>
              Open an existing project folder to continue working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" data-testid="open-existing-project">
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse Folder
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="max-w-2xl w-full">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Projects
          </h2>
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setCurrentProject(project)}
                data-testid={`recent-project-${project.id}`}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Folder className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{project.path}</p>
                  </div>
                  {project.lastOpened && (
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(project.lastOpened).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent data-testid="new-project-dialog">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new project directory with initial configuration files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="my-awesome-project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                data-testid="project-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-path">Parent Directory</Label>
              <div className="flex gap-2">
                <Input
                  id="project-path"
                  placeholder="/path/to/projects"
                  value={newProjectPath}
                  onChange={(e) => setNewProjectPath(e.target.value)}
                  className="flex-1"
                  data-testid="project-path-input"
                />
                <Button variant="secondary" onClick={handleSelectDirectory} data-testid="browse-directory">
                  Browse
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName || !newProjectPath || isCreating}
              data-testid="confirm-create-project"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
