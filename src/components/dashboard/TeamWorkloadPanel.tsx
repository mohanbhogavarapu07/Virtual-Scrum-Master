import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const TeamWorkloadPanel = () => {
  const { teamStats } = useApp();

  const getWorkloadBadge = (workload: string) => {
    switch (workload) {
      case "heavy":
        return <Badge variant="outline" className="text-2xs bg-destructive/10 text-destructive border-destructive/20">Heavy</Badge>;
      case "optimal":
        return <Badge variant="outline" className="text-2xs bg-success/10 text-success border-success/20">Optimal</Badge>;
      case "light":
        return <Badge variant="outline" className="text-2xs bg-warning/10 text-warning border-warning/20">Light</Badge>;
      default:
        return null;
    }
  };

  const getProgressColor = (workload: string) => {
    switch (workload) {
      case "heavy":
        return "bg-destructive";
      case "optimal":
        return "bg-success";
      case "light":
        return "bg-warning";
      default:
        return "bg-muted";
    }
  };

  const maxPoints = Math.max(...teamStats.map(t => t.totalPoints));

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Team Workload</h3>
      </div>

      <div className="p-4 space-y-4">
        {teamStats.map((member) => (
          <div key={member.initials} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 flex items-center justify-center text-2xs font-semibold text-white">
                  {member.initials}
                </div>
                <span className="text-sm font-medium">{member.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{member.totalPoints} pts</span>
                {getWorkloadBadge(member.workload)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all", getProgressColor(member.workload))}
                  style={{ width: `${(member.totalPoints / maxPoints) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-2xs text-muted-foreground">
              <span>{member.completed} completed</span>
              <span>{member.inProgress} in progress</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
