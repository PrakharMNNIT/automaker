"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAppStore, Feature } from "@/store/app-store";
import { getElectronAPI } from "@/lib/electron";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { Plus, RefreshCw } from "lucide-react";

type ColumnId = Feature["status"];

const COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "bg-zinc-500" },
  { id: "planned", title: "Planned", color: "bg-blue-500" },
  { id: "in_progress", title: "In Progress", color: "bg-yellow-500" },
  { id: "review", title: "Review", color: "bg-purple-500" },
  { id: "verified", title: "Verified", color: "bg-green-500" },
  { id: "failed", title: "Failed", color: "bg-red-500" },
];

export function BoardView() {
  const { currentProject, features, setFeatures, addFeature, updateFeature, moveFeature } =
    useAppStore();
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFeature, setNewFeature] = useState({
    category: "",
    description: "",
    steps: [""],
  });
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load features from file
  const loadFeatures = useCallback(async () => {
    if (!currentProject) return;

    setIsLoading(true);
    try {
      const api = getElectronAPI();
      const result = await api.readFile(`${currentProject.path}/feature_list.json`);

      if (result.success && result.content) {
        const parsed = JSON.parse(result.content);
        const featuresWithIds = parsed.map(
          (f: Omit<Feature, "id" | "status">, index: number) => ({
            ...f,
            id: `feature-${index}-${Date.now()}`,
            status: f.passes ? "verified" : ("backlog" as ColumnId),
          })
        );
        setFeatures(featuresWithIds);
      }
    } catch (error) {
      console.error("Failed to load features:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject, setFeatures]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  // Save features to file
  const saveFeatures = useCallback(async () => {
    if (!currentProject) return;

    try {
      const api = getElectronAPI();
      const toSave = features.map((f) => ({
        category: f.category,
        description: f.description,
        steps: f.steps,
        passes: f.status === "verified",
      }));
      await api.writeFile(
        `${currentProject.path}/feature_list.json`,
        JSON.stringify(toSave, null, 2)
      );
    } catch (error) {
      console.error("Failed to save features:", error);
    }
  }, [currentProject, features]);

  // Save when features change
  useEffect(() => {
    if (features.length > 0) {
      saveFeatures();
    }
  }, [features, saveFeatures]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const feature = features.find((f) => f.id === active.id);
    if (feature) {
      setActiveFeature(feature);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveFeature(null);

    if (!over) return;

    const featureId = active.id as string;
    const overId = over.id as string;

    // Check if we dropped on a column
    const column = COLUMNS.find((c) => c.id === overId);
    if (column) {
      moveFeature(featureId, column.id);
    } else {
      // Dropped on another feature - find its column
      const overFeature = features.find((f) => f.id === overId);
      if (overFeature) {
        moveFeature(featureId, overFeature.status);
      }
    }
  };

  const handleAddFeature = () => {
    addFeature({
      category: newFeature.category || "Uncategorized",
      description: newFeature.description,
      steps: newFeature.steps.filter((s) => s.trim()),
      passes: false,
      status: "backlog",
    });
    setNewFeature({ category: "", description: "", steps: [""] });
    setShowAddDialog(false);
  };

  const handleUpdateFeature = () => {
    if (!editingFeature) return;

    updateFeature(editingFeature.id, {
      category: editingFeature.category,
      description: editingFeature.description,
      steps: editingFeature.steps,
    });
    setEditingFeature(null);
  };

  const getColumnFeatures = (columnId: ColumnId) => {
    return features.filter((f) => f.status === columnId);
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="board-view-no-project">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" data-testid="board-view-loading">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="board-view">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-xl font-bold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground">{currentProject.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadFeatures} data-testid="refresh-board">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)} data-testid="add-feature-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((column) => {
              const columnFeatures = getColumnFeatures(column.id);
              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  count={columnFeatures.length}
                >
                  <SortableContext
                    items={columnFeatures.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnFeatures.map((feature) => (
                      <KanbanCard
                        key={feature.id}
                        feature={feature}
                        onEdit={() => setEditingFeature(feature)}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeFeature && (
              <Card className="w-72 opacity-90 rotate-3 shadow-xl">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">{activeFeature.description}</CardTitle>
                  <CardDescription className="text-xs">{activeFeature.category}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Feature Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent data-testid="add-feature-dialog">
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
            <DialogDescription>Create a new feature card for the Kanban board.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Core, UI, API"
                value={newFeature.category}
                onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                data-testid="feature-category-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Describe the feature..."
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                data-testid="feature-description-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Steps</Label>
              {newFeature.steps.map((step, index) => (
                <Input
                  key={index}
                  placeholder={`Step ${index + 1}`}
                  value={step}
                  onChange={(e) => {
                    const steps = [...newFeature.steps];
                    steps[index] = e.target.value;
                    setNewFeature({ ...newFeature, steps });
                  }}
                  data-testid={`feature-step-${index}-input`}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewFeature({ ...newFeature, steps: [...newFeature.steps, ""] })
                }
                data-testid="add-step-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddFeature}
              disabled={!newFeature.description}
              data-testid="confirm-add-feature"
            >
              Add Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Feature Dialog */}
      <Dialog open={!!editingFeature} onOpenChange={() => setEditingFeature(null)}>
        <DialogContent data-testid="edit-feature-dialog">
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
            <DialogDescription>Modify the feature details.</DialogDescription>
          </DialogHeader>
          {editingFeature && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editingFeature.category}
                  onChange={(e) =>
                    setEditingFeature({ ...editingFeature, category: e.target.value })
                  }
                  data-testid="edit-feature-category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingFeature.description}
                  onChange={(e) =>
                    setEditingFeature({ ...editingFeature, description: e.target.value })
                  }
                  data-testid="edit-feature-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Steps</Label>
                {editingFeature.steps.map((step, index) => (
                  <Input
                    key={index}
                    value={step}
                    onChange={(e) => {
                      const steps = [...editingFeature.steps];
                      steps[index] = e.target.value;
                      setEditingFeature({ ...editingFeature, steps });
                    }}
                    data-testid={`edit-feature-step-${index}`}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditingFeature({
                      ...editingFeature,
                      steps: [...editingFeature.steps, ""],
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingFeature(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFeature} data-testid="confirm-edit-feature">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
