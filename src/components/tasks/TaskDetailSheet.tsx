import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { ApiTask, TaskStatus } from "@/types";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

function getStatusButtonClass(status: TaskStatus, isActive: boolean): string {
  const base = "h-8 text-xs font-medium transition-colors border";
  if (!isActive) {
    return base;
  }
  switch (status) {
    case "TODO":
      return `${base} bg-slate-600 text-white border-slate-600 hover:bg-slate-700 hover:text-white`;
    case "IN_PROGRESS":
      return `${base} bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white`;
    case "DONE":
      return `${base} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:text-white`;
    default:
      return `${base} bg-primary text-primary-foreground border-primary`;
  }
}

interface TaskDetailSheetProps {
  task: ApiTask | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getUserName?: (userId: number) => string;
  onEdit?: (task: ApiTask) => void;
  onDelete?: (task: ApiTask) => void;
  onStatusChange?: (taskId: number, status: TaskStatus) => void;
  isLoading?: boolean;
}

export const TaskDetailSheet = ({
  task,
  open,
  onOpenChange,
  getUserName = () => "—",
  onEdit,
  onDelete,
  onStatusChange,
  isLoading,
}: TaskDetailSheetProps) => {
  const statusList = useMemo(() => ["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[], []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-border px-6 py-4 space-y-1">
          <SheetTitle className="text-left text-base font-semibold flex items-center gap-2 flex-wrap">
            {task ? (
              <>
                <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  TASK-{task.task_id}
                </span>
                <span className="break-words">{task.title}</span>
              </>
            ) : (
              "Task"
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">Task details</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && task && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Status section */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {statusList.map((s) => (
                    <Button
                      key={s}
                      variant="outline"
                      size="sm"
                      className={getStatusButtonClass(s, task.status === s)}
                      onClick={() => onStatusChange?.(task.task_id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: <strong>{STATUS_LABELS[task.status] ?? task.status}</strong>
                </p>
              </section>

              {/* Assignee */}
              <section className="space-y-1.5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Assignee
                </h3>
                <p className="text-sm text-foreground">
                  {task.assigned_to_user_id
                    ? getUserName(task.assigned_to_user_id)
                    : "Unassigned"}
                </p>
              </section>

              {/* Description */}
              {task.description && (
                <section className="space-y-1.5">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Description
                  </h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {task.description}
                  </p>
                </section>
              )}

              {/* Meta */}
              <section className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Sprint ID: {task.sprint_id}
                  {task.created_at && (
                    <> · Created {new Date(task.created_at).toLocaleDateString()}</>
                  )}
                </p>
              </section>
            </div>

            {/* Footer actions */}
            <SheetFooter className="shrink-0 flex-row gap-2 justify-end border-t border-border px-6 py-4 bg-muted/30">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEdit(task)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit task
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(task)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
