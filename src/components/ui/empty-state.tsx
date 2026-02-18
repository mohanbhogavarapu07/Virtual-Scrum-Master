import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, children, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-muted-foreground" />
    </div>
    <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
    {description && <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
);
