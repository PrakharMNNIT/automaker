"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import {
  FolderOpen,
  Plus,
  Settings,
  FileText,
  LayoutGrid,
  Code,
  Bot,
  ChevronLeft,
  ChevronRight,
  Folder,
  X,
  Moon,
  Sun,
  Search,
  Wrench,
} from "lucide-react";

export function Sidebar() {
  const {
    projects,
    currentProject,
    currentView,
    sidebarOpen,
    theme,
    setCurrentProject,
    setCurrentView,
    toggleSidebar,
    removeProject,
    setTheme,
  } = useAppStore();

  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const navItems = [
    { id: "spec" as const, label: "Spec Editor", icon: FileText },
    { id: "board" as const, label: "Kanban Board", icon: LayoutGrid },
    { id: "code" as const, label: "Code View", icon: Code },
    { id: "analysis" as const, label: "Analysis", icon: Search },
    { id: "agent" as const, label: "Agent Chat", icon: Bot },
    { id: "tools" as const, label: "Agent Tools", icon: Wrench },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border titlebar-drag-region">
        {sidebarOpen && (
          <h1 className="text-lg font-bold text-sidebar-foreground">
            Automaker
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="titlebar-no-drag text-sidebar-foreground hover:bg-sidebar-accent"
          data-testid="toggle-sidebar"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Project Actions */}
      <div className="p-2 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            !sidebarOpen && "justify-center px-2"
          )}
          onClick={() => setCurrentView("welcome")}
          data-testid="new-project-button"
        >
          <Plus className="h-4 w-4" />
          {sidebarOpen && <span>New Project</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            !sidebarOpen && "justify-center px-2"
          )}
          onClick={() => setCurrentView("welcome")}
          data-testid="open-project-button"
        >
          <FolderOpen className="h-4 w-4" />
          {sidebarOpen && <span>Open Project</span>}
        </Button>
      </div>

      {/* Projects List */}
      {sidebarOpen && projects.length > 0 && (
        <div className="flex-1 overflow-y-auto px-2">
          <p className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent Projects
          </p>
          <div className="space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors",
                  currentProject?.id === project.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                )}
                onClick={() => setCurrentProject(project)}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                data-testid={`project-${project.id}`}
              >
                <Folder className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-sm">{project.name}</span>
                {hoveredProject === project.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProject(project.id);
                    }}
                    data-testid={`remove-project-${project.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation - Only show when a project is open */}
      {currentProject && (
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {sidebarOpen && (
            <p className="px-2 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Views
            </p>
          )}
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                !sidebarOpen && "justify-center px-2",
                currentView === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              onClick={() => setCurrentView(item.id)}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="h-4 w-4" />
              {sidebarOpen && <span>{item.label}</span>}
            </Button>
          ))}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-auto border-t border-sidebar-border p-2 space-y-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            !sidebarOpen && "justify-center px-2"
          )}
          onClick={toggleTheme}
          data-testid="toggle-theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {sidebarOpen && (
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
            !sidebarOpen && "justify-center px-2",
            currentView === "settings" && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
          onClick={() => setCurrentView("settings")}
          data-testid="settings-button"
        >
          <Settings className="h-4 w-4" />
          {sidebarOpen && <span>Settings</span>}
        </Button>
      </div>
    </aside>
  );
}
