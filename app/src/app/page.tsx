"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { WelcomeView } from "@/components/views/welcome-view";
import { BoardView } from "@/components/views/board-view";
import { SpecView } from "@/components/views/spec-view";
import { CodeView } from "@/components/views/code-view";
import { AgentView } from "@/components/views/agent-view";
import { SettingsView } from "@/components/views/settings-view";
import { AnalysisView } from "@/components/views/analysis-view";
import { AgentToolsView } from "@/components/views/agent-tools-view";
import { useAppStore } from "@/store/app-store";
import { getElectronAPI, isElectron } from "@/lib/electron";

export default function Home() {
  const { currentView, setIpcConnected, theme } = useAppStore();

  // Test IPC connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const api = getElectronAPI();
        const result = await api.ping();
        setIpcConnected(result === "pong" || result === "pong (mock)");
      } catch (error) {
        console.error("IPC connection failed:", error);
        setIpcConnected(false);
      }
    };

    testConnection();
  }, [setIpcConnected]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System theme
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  const renderView = () => {
    switch (currentView) {
      case "welcome":
        return <WelcomeView />;
      case "board":
        return <BoardView />;
      case "spec":
        return <SpecView />;
      case "code":
        return <CodeView />;
      case "agent":
        return <AgentView />;
      case "settings":
        return <SettingsView />;
      case "analysis":
        return <AnalysisView />;
      case "tools":
        return <AgentToolsView />;
      default:
        return <WelcomeView />;
    }
  };

  return (
    <main className="flex h-screen overflow-hidden" data-testid="app-container">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">{renderView()}</div>

      {/* Environment indicator */}
      {!isElectron() && (
        <div className="fixed bottom-4 right-4 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full border border-yellow-500/20">
          Web Mode (Mock IPC)
        </div>
      )}
    </main>
  );
}
