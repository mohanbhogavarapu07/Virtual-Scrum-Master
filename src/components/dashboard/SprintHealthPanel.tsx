import { useAdminDashboard } from "@/hooks/useApiHooks";
import { cn } from "@/lib/utils";
import { CheckCircle2, TrendingUp } from "lucide-react";

export const SprintHealthPanel = () => {
  const { data: dashboard } = useAdminDashboard();

  const tasksByStatus = dashboard?.tasks_by_status ?? {};
  const totalTasks = dashboard?.total_tasks ?? 0;
  const doneTasks = tasksByStatus["DONE"] ?? 0;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Sprint Health</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
            <CheckCircle2 className="w-3 h-3" /> Active
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Task Completion</span>
            <span className="text-xs font-semibold">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                progressPercent >= 60 ? "bg-success" :
                progressPercent >= 30 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-semibold">{doneTasks}</p>
            <p className="text-2xs text-muted-foreground">Done</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{tasksByStatus["IN_PROGRESS"] ?? 0}</p>
            <p className="text-2xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <p className="text-lg font-semibold">{tasksByStatus["TODO"] ?? 0}</p>
            </div>
            <p className="text-2xs text-muted-foreground">To Do</p>
          </div>
        </div>
      </div>
    </div>
  );
};
