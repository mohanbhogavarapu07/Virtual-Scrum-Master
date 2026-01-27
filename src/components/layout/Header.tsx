import { Bell, Search, Filter, ChevronDown, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoleSelector } from "./RoleSelector";
import { useApp } from "@/context/AppContext";
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
  const { blockers, projects } = useApp();

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-10">
      {/* Left: Search & Filters */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects, tasks, people..." 
            className="pl-8 h-8 text-sm bg-background border-border"
          />
        </div>
        
        {/* Quick Filters */}
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
                <DropdownMenuItem key={p.id} className="text-xs">{p.name}</DropdownMenuItem>
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
              <DropdownMenuItem className="text-xs">Sprint 5 (Active)</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">Sprint 4</DropdownMenuItem>
              <DropdownMenuItem className="text-xs">Sprint 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* AI Assistant Quick Access */}
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Bot className="w-3.5 h-3.5" />
          Ask AI
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="w-4 h-4" />
              {blockers.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-xs">Notifications</span>
              <Badge variant="secondary" className="text-2xs">{blockers.length} new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {blockers.slice(0, 3).map(b => (
              <DropdownMenuItem key={b.id} className="flex flex-col items-start gap-1 py-2">
                <span className="text-xs font-medium">Blocker: {b.taskTitle}</span>
                <span className="text-2xs text-muted-foreground">{b.reason}</span>
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
