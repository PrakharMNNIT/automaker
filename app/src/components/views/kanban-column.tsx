"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-72 h-full rounded-lg bg-muted/50 transition-colors",
        isOver && "bg-muted"
      )}
      data-testid={`kanban-column-${id}`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className={cn("w-3 h-3 rounded-full", color)} />
        <h3 className="font-medium text-sm flex-1">{title}</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">{children}</div>
    </div>
  );
}
