import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  MessageSquare, 
  Bot, 
  RefreshCw, 
  AlertCircle,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const ActivityFeed = () => {
  const { activities } = useApp();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_update":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "standup":
        return <MessageSquare className="w-3.5 h-3.5" />;
      case "ai_action":
        return <Bot className="w-3.5 h-3.5" />;
      case "sprint_change":
        return <RefreshCw className="w-3.5 h-3.5" />;
      case "blocker":
        return <AlertCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getActivityStyle = (type: string) => {
    switch (type) {
      case "task_update":
        return "bg-success/10 text-success";
      case "ai_action":
        return "bg-primary/10 text-primary";
      case "blocker":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
      </div>

      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className="px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                getActivityStyle(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>
                  {" "}
                  <span className="text-muted-foreground">{activity.action}</span>
                  {activity.target && (
                    <>
                      {" "}
                      <span className="font-medium">{activity.target}</span>
                    </>
                  )}
                </p>
                {activity.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                )}
                <p className="text-2xs text-muted-foreground mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
