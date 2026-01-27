import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
    period?: string;
  };
  icon?: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  className?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  iconColor = "text-primary",
  subtitle,
  className 
}: MetricCardProps) => {
  const TrendIcon = change?.trend === "up" ? TrendingUp : 
                    change?.trend === "down" ? TrendingDown : Minus;

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          
          {change && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <TrendIcon className={cn(
                "w-3.5 h-3.5",
                change.trend === "up" ? "text-success" :
                change.trend === "down" ? "text-destructive" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs font-medium",
                change.trend === "up" ? "text-success" :
                change.trend === "down" ? "text-destructive" : "text-muted-foreground"
              )}>
                {change.value}
              </span>
              {change.period && (
                <span className="text-xs text-muted-foreground">{change.period}</span>
              )}
            </div>
          )}

          {subtitle && !change && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={cn("p-2 rounded-md bg-muted/50", iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
