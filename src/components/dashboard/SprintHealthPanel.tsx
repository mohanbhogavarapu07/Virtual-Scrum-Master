import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";

export const SprintHealthPanel = () => {
  const { sprintMetrics, tasks } = useApp();

  const burndownData = sprintMetrics.burndownIdeal.map((ideal, i) => ({
    day: `Day ${i + 1}`,
    ideal,
    actual: sprintMetrics.burndownActual[i] ?? null,
  }));

  const completedPoints = tasks.filter(t => t.status === "done").reduce((sum, t) => sum + t.storyPoints, 0);
  const totalPoints = tasks.reduce((sum, t) => sum + t.storyPoints, 0);
  const progressPercent = Math.round((completedPoints / totalPoints) * 100);

  const getRiskBadge = () => {
    switch (sprintMetrics.riskStatus) {
      case "on-track":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
            <CheckCircle2 className="w-3 h-3" /> On Track
          </span>
        );
      case "at-risk":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">
            <AlertTriangle className="w-3 h-3" /> At Risk
          </span>
        );
      case "behind":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive">
            <Clock className="w-3 h-3" /> Behind
          </span>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">Sprint Health</h3>
          {getRiskBadge()}
        </div>
        <span className="text-xs text-muted-foreground">{sprintMetrics.daysRemaining} days remaining</span>
      </div>

      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Sprint Progress</span>
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

        {/* Burndown Chart */}
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndownData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ideal" 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-semibold">{completedPoints}</p>
            <p className="text-2xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{sprintMetrics.remainingPoints}</p>
            <p className="text-2xs text-muted-foreground">Remaining</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <p className="text-lg font-semibold">{sprintMetrics.velocity}</p>
            </div>
            <p className="text-2xs text-muted-foreground">Velocity</p>
          </div>
        </div>
      </div>
    </div>
  );
};
