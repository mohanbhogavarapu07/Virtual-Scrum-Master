import { cn } from "@/lib/utils";
import { AlertCircle, Clock, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminDashboard } from "@/hooks/useApiHooks";

export const BlockersPanel = () => {
  const { data: dashboard } = useAdminDashboard();
  const bottlenecks = dashboard?.bottlenecks ?? [];

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Blockers & Alerts</h3>
          {bottlenecks.length > 0 && (
            <Badge variant="destructive" className="text-2xs px-1.5 py-0">
              {bottlenecks.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {bottlenecks.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm font-medium">No blockers detected</p>
            <p className="text-xs text-muted-foreground">All tasks are flowing smoothly</p>
          </div>
        ) : (
          bottlenecks.map((item) => (
            <div key={item.task_id} className="p-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
                  (item.days_in_progress ?? 0) > 7 ? "bg-destructive/10" : "bg-warning/10"
                )}>
                  {(item.days_in_progress ?? 0) > 7 ? (
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-warning" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <Badge variant="outline" className="text-2xs capitalize">
                      {item.status}
                    </Badge>
                  </div>
                  {item.days_in_progress != null && (
                    <span className="text-2xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {item.days_in_progress}d in progress
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
