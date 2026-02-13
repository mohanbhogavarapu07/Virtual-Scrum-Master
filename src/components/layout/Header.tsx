import logoImg from "@/assets/logo.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";
import { useAllTasks, useDashboard, useProjects } from "@/hooks/useApiHooks";
import { Bell, ChevronDown, FolderKanban, ListTodo, Menu, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RoleSelector } from "./RoleSelector";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: projectsRaw = [] } = useProjects();
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const { data: tasksRaw = [] } = useAllTasks();
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const { data: dashboard } = useDashboard();
  const bottlenecks = (dashboard && "bottlenecks" in dashboard) ? dashboard.bottlenecks : [];

  const q = searchQuery.trim().toLowerCase();
  const filteredProjects = useMemo(
    () =>
      q.length < 1
        ? []
        : projects.filter(
            (p) =>
              (p.project_name && p.project_name.toLowerCase().includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q))
          ),
    [projects, q]
  );
  const filteredTasks = useMemo(
    () =>
      q.length < 1
        ? []
        : tasks.filter(
            (t) =>
              (t.title && t.title.toLowerCase().includes(q)) ||
              (t.description && t.description.toLowerCase().includes(q))
          ),
    [tasks, q]
  );
  const showResults = searchOpen;

  const handleSelectProject = (projectId: number) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(`/project/${projectId}`);
  };
  const handleSelectTask = (task: { task_id: number; sprint_id: number }) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(`/sprint/${task.sprint_id}`);
  };

  return (
    <header className="flex h-11 items-center gap-2 border-b border-border bg-[hsl(var(--card))] px-3 sticky top-0 z-10 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0 md:h-9 md:w-9"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link
        to="/dashboard"
        className="flex items-center gap-2 flex-shrink-0 rounded p-1 -m-1 hover:bg-muted/80 transition-colors"
      >
        <img src={logoImg} alt="Logo" className="h-6 w-6 rounded" />
        <span className="font-semibold text-sm hidden sm:inline truncate max-w-[140px]">VSM</span>
      </Link>

      <Popover open={showResults} onOpenChange={setSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1 max-w-xl min-w-0 mx-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search projects, tasks..."
              className="h-8 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-80 overflow-y-auto p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          {q.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Type to search projects and tasks.</p>
          ) : (
            <>
              {filteredProjects.length > 0 && (
                <div className="py-1">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase">Projects</p>
                  {filteredProjects.slice(0, 5).map((p) => (
                    <button
                      key={p.project_id}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted"
                      onClick={() => handleSelectProject(p.project_id)}
                    >
                      <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{p.project_name}</span>
                    </button>
                  ))}
                </div>
              )}
              {filteredTasks.length > 0 && (
                <div className="py-1 border-t">
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase">Tasks</p>
                  {filteredTasks.slice(0, 5).map((t) => (
                    <button
                      key={t.task_id}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted"
                      onClick={() => handleSelectTask(t)}
                    >
                      <ListTodo className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{t.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">Sprint {t.sprint_id}</span>
                    </button>
                  ))}
                </div>
              )}
              {q.length > 0 && filteredProjects.length === 0 && filteredTasks.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">No projects or tasks match.</p>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Create</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs">Create new</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm cursor-pointer" onSelect={() => navigate("/projects?openCreate=1")}>
                Project
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer" onSelect={() => navigate("/tasks?openCreate=1")}>
                Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {Array.isArray(bottlenecks) && bottlenecks.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-xs">Notifications</span>
              {Array.isArray(bottlenecks) && bottlenecks.length > 0 && (
                <Badge variant="secondary" className="text-2xs">{bottlenecks.length}</Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Array.isArray(bottlenecks) && bottlenecks.length > 0 ? (
              bottlenecks.slice(0, 5).map((b: { task_id?: number; title?: string; status?: string }) => (
                <DropdownMenuItem key={b.task_id} className="flex flex-col items-start gap-0.5 py-2 text-xs">
                  <span className="font-medium">{b.title ?? "Task"}</span>
                  <span className="text-muted-foreground">{b.status}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="text-xs text-muted-foreground">No new notifications</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <RoleSelector />
      </div>
    </header>
  );
};
