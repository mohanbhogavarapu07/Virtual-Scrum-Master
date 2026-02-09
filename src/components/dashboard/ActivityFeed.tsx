import { Clock } from "lucide-react";

export const ActivityFeed = () => {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Recent Activity</h3>
      </div>
      <div className="p-4 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Activity feed loads from your project chat logs and task updates.</p>
      </div>
    </div>
  );
};
