import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const BlockersPanel = () => {
  const { blockers, tasks } = useApp();

  // Find aging tasks (in progress > 5 days)
  const agingTasks = tasks.filter(t => t.status === "inprogress" && (t.daysInProgress || 0) > 5);

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Blockers & Alerts</h3>
          {blockers.length > 0 && (
            <Badge variant="destructive" className="text-2xs px-1.5 py-0">
              {blockers.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {blockers.length === 0 && agingTasks.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm font-medium">No blockers detected</p>
            <p className="text-xs text-muted-foreground">All tasks are flowing smoothly</p>
          </div>
        ) : (
          <>
            {/* Active Blockers */}
            {blockers.map((blocker) => (
              <div key={blocker.id} className="p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
                    blocker.severity === "high" ? "bg-destructive/10" :
                    blocker.severity === "medium" ? "bg-warning/10" : "bg-muted"
                  )}>
                    <AlertCircle className={cn(
                      "w-3.5 h-3.5",
                      blocker.severity === "high" ? "text-destructive" :
                      blocker.severity === "medium" ? "text-warning" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium truncate">{blocker.taskTitle}</p>
                      <Badge variant="outline" className="text-2xs capitalize">
                        {blocker.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{blocker.reason}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-2xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {blocker.daysBlocked}d blocked
                      </span>
                      <span className="text-2xs text-muted-foreground">
                        Assigned to {blocker.assignee}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Aging Tasks */}
            {agingTasks.map((task) => (
              <div key={task.id} className="p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <Badge variant="outline" className="text-2xs">
                        Aging
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In progress for {task.daysInProgress} days
                    </p>
                    <span className="text-2xs text-muted-foreground mt-1.5 block">
                      Assigned to {task.assignee} · {task.storyPoints} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
