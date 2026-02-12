import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { ApiTask, TaskStatus } from "@/types";
import { Loader2 } from "lucide-react";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

interface TaskDetailSheetProps {
  task: ApiTask | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getUserName?: (userId: number) => string;
  onEdit?: (task: ApiTask) => void;
  onStatusChange?: (taskId: number, status: TaskStatus) => void;
  isLoading?: boolean;
}

export const TaskDetailSheet = ({
  task,
  open,
  onOpenChange,
  getUserName = () => "—",
  onEdit,
  onStatusChange,
  isLoading,
}: TaskDetailSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-base font-semibold flex items-center gap-2">
            {task ? (
              <>
                <span className="text-muted-foreground font-mono text-sm">TASK-{task.task_id}</span>
                {task.title}
              </>
            ) : (
              "Task"
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Task details
          </SheetDescription>
        </SheetHeader>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && task && (
          <div className="space-y-4 pt-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</div>
              <Badge variant="secondary" className="font-normal">
                {STATUS_LABELS[task.status] ?? task.status}
              </Badge>
              {onStatusChange && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((s) => (
                    <Button
                      key={s}
                      variant={task.status === s ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onStatusChange(task.task_id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Assignee</div>
              <p className="text-sm">{getUserName(task.assigned_to_user_id)}</p>
            </div>
            {task.description && (
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</div>
                <p className="text-sm whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Sprint ID: {task.sprint_id} · Created {task.created_at ? new Date(task.created_at).toLocaleDateString() : "—"}
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => onEdit(task)}>
                Edit task
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
