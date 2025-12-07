"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Feature } from "@/store/app-store";
import { GripVertical, Edit, Play, CheckCircle2, Circle } from "lucide-react";

interface KanbanCardProps {
  feature: Feature;
  onEdit: () => void;
}

export function KanbanCard({ feature, onEdit }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all",
        isDragging && "opacity-50 scale-105 shadow-lg"
      )}
      data-testid={`kanban-card-${feature.id}`}
      {...attributes}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start gap-2">
          <div
            {...listeners}
            className="mt-0.5 cursor-grab touch-none"
            data-testid={`drag-handle-${feature.id}`}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm leading-tight">{feature.description}</CardTitle>
            <CardDescription className="text-xs mt-1">{feature.category}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {/* Steps Preview */}
        {feature.steps.length > 0 && (
          <div className="mb-3 space-y-1">
            {feature.steps.slice(0, 3).map((step, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                {feature.passes ? (
                  <CheckCircle2 className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 mt-0.5 shrink-0" />
                )}
                <span className="truncate">{step}</span>
              </div>
            ))}
            {feature.steps.length > 3 && (
              <p className="text-xs text-muted-foreground pl-5">
                +{feature.steps.length - 3} more steps
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            data-testid={`edit-feature-${feature.id}`}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:text-primary"
            data-testid={`run-feature-${feature.id}`}
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
