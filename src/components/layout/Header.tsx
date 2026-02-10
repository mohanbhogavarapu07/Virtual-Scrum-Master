import { Bell, Search, Filter, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSelector } from "./RoleSelector";
import { useProjects } from "@/hooks/useApiHooks";
import { useAdminDashboard } from "@/hooks/useApiHooks";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { data: projects = [] } = useProjects();
  const { data: dashboard } = useAdminDashboard();
  const bottlenecks = dashboard?.bottlenecks ?? [];

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects, tasks, people..." 
            className="pl-8 h-8 text-sm bg-background border-border"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" />
                All Projects
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">Filter by Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">All Projects</DropdownMenuItem>
              {projects.map(p => (
                <DropdownMenuItem key={p.project_id} className="text-xs">{p.project_name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                All Sprints
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem className="text-xs">All Sprints</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <img src={logoImg} alt="" className="w-4 h-4 rounded-sm" />
          Ask AI
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="w-4 h-4" />
              {bottlenecks.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-xs">Notifications</span>
              <Badge variant="secondary" className="text-2xs">{bottlenecks.length} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {bottlenecks.slice(0, 3).map(b => (
              <DropdownMenuItem key={b.task_id} className="flex flex-col items-start gap-1 py-2">
                <span className="text-xs font-medium">Bottleneck: {b.title}</span>
                <span className="text-2xs text-muted-foreground">Status: {b.status}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-primary justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <RoleSelector />
      </div>
    </header>
  );
};
