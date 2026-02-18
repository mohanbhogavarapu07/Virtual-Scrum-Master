import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; dotClass: string; bgClass: string }> = {
  TODO: { label: "To Do", dotClass: "bg-muted-foreground", bgClass: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", dotClass: "bg-[hsl(var(--primary))]", bgClass: "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" },
  DONE: { label: "Done", dotClass: "bg-[hsl(var(--success))]", bgClass: "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]" },
  PLANNED: { label: "Planned", dotClass: "bg-muted-foreground", bgClass: "bg-muted text-muted-foreground" },
  ACTIVE: { label: "Active", dotClass: "bg-[hsl(var(--primary))]", bgClass: "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" },
  COMPLETED: { label: "Completed", dotClass: "bg-[hsl(var(--success))]", bgClass: "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge = ({ status, className, showDot = true }: StatusBadgeProps) => {
  const config = statusConfig[status] ?? { label: status, dotClass: "bg-muted-foreground", bgClass: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", config.bgClass, className)}>
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />}
      {config.label}
    </span>
  );
};
