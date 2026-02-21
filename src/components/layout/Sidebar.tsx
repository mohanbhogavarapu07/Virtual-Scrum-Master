import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { useProject, useProjects, useProjectSprints, useSprint } from "@/hooks/useApiHooks";
import { cn } from "@/lib/utils";
import {
    Activity,
    BarChart3,
    ChevronDown,
    FolderKanban,
    LayoutDashboard,
    LayoutGrid,
    List,
    ListTodo,
    Settings,
    Users,
} from "lucide-react";
import { NavLink, useLocation, useParams } from "react-router-dom";

const globalNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Performance", href: "/performance", icon: Activity },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminProjectScopedNav = (projectId: number) => [
  { name: "Dashboard", href: `/project/${projectId}/dashboard`, icon: LayoutDashboard },
  { name: "Tasks", href: `/project/${projectId}/tasks`, icon: ListTodo },
  { name: "Performance", href: `/project/${projectId}/performance`, icon: Activity },
  { name: "Analytics", href: `/project/${projectId}/analytics`, icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onToggle, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { pathname } = useLocation();
  const params = useParams();
  const paramId = params?.id ? Number(params.id) : null;

  const isOnSprintRoute = pathname.startsWith("/sprint/");
  const isOnProjectRoute = pathname.startsWith("/project/");

  const { data: sprint } = useSprint(isOnSprintRoute && paramId ? paramId : 0);
  const projectIdFromSprint = sprint?.project_id ?? null;

  const projectIdFromRoute = isOnProjectRoute ? paramId : null;
  const effectiveProjectId = projectIdFromRoute ?? projectIdFromSprint;

  const { data: projectsRaw = [] } = useProjects();
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const { data: project } = useProject(effectiveProjectId ?? 0);
  const { data: sprintsRaw = [] } = useProjectSprints(effectiveProjectId ?? 0);
  const sprints = Array.isArray(sprintsRaw) ? sprintsRaw : [];

  const isAdminInProjectContext = isAdmin && effectiveProjectId != null && (isOnProjectRoute && pathname.includes(String(effectiveProjectId)) || isOnSprintRoute);
  const isProjectDetailOnly = pathname === `/project/${effectiveProjectId}` && effectiveProjectId;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-56 flex-col bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] shadow-lg transition-transform duration-200 ease-out md:relative md:z-auto md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-0"
        )}
      >
        <div className="flex h-11 items-center gap-2 border-b border-[hsl(var(--sidebar-border))] px-3 flex-shrink-0">
          <img src={logo} alt="VSM" className="h-6 w-6 rounded flex-shrink-0" />
          <span className="font-semibold text-sm text-[hsl(var(--sidebar-foreground))] truncate">Virtual Scrum</span>
        </div>

        {/* Projects section: always show projects list (never replace with sprints). Admin selects project from here. */}
        <div className="px-2 py-2 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-md text-[hsl(var(--sidebar-muted))] text-xs font-medium uppercase tracking-wider">
            <span>Projects</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-0.5 mt-1">
            {projects.slice(0, 12).map((p) => (
              <NavLink
                key={p.project_id}
                to={isAdmin ? `/project/${p.project_id}/dashboard` : `/project/${p.project_id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                    isActive || (effectiveProjectId != null && p.project_id === effectiveProjectId)
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                      : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                  )
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] flex-shrink-0" />
                <span className="truncate">{p.project_name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {/* Admin in project context: subsection "Sprints" (list of sprints under this project), then Sprints & Backlog, Dashboard, Tasks, etc. */}
          {isAdminInProjectContext && effectiveProjectId && (
            <>
              <div className="px-2 py-1.5 text-[hsl(var(--sidebar-muted))] text-xs font-medium uppercase tracking-wider">
                {project?.project_name ?? "Current project"}
              </div>
              {/* Sprints subsection: always show (sprints of this project, or "No sprints" so section is visible) */}
              <div className="mb-1">
                <div className="px-2 py-1 text-[hsl(var(--sidebar-muted))] text-[10px] font-medium uppercase tracking-wider">
                  Sprints
                </div>
                <div className="space-y-0.5 pl-1">
                  {sprints.length > 0 ? (
                    sprints.map((s) => (
                      <NavLink
                        key={s.sprint_id}
                        to={`/sprint/${s.sprint_id}`}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                            isActive
                              ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                              : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                          )
                        }
                      >
                        <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{s.sprint_name}</span>
                      </NavLink>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-[hsl(var(--sidebar-muted))]">No sprints yet</div>
                  )}
                </div>
              </div>
              <NavLink
                to={`/project/${effectiveProjectId}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                    isActive && isProjectDetailOnly
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                      : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                  )
                }
              >
                <List className="h-4 w-4 flex-shrink-0" />
                Sprints &amp; Backlog
              </NavLink>
              {adminProjectScopedNav(effectiveProjectId).map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                        : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
              <div className="my-2 border-t border-[hsl(var(--sidebar-border))]" />
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                      : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                  )
                }
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                Settings
              </NavLink>
            </>
          )}

          {/* Admin on /projects: only Settings in menu (project list is above) */}
          {isAdmin && !isAdminInProjectContext && (
            <>
              <div className="px-2 py-1.5 text-[hsl(var(--sidebar-muted))] text-xs font-medium uppercase tracking-wider">
                Menu
              </div>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                      : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                  )
                }
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                Settings
              </NavLink>
            </>
          )}

          {/* Employee: full global nav; when on project or sprint show Sprints + Team for current project */}
          {!isAdmin && (
            <>
              {(pathname.startsWith("/project/") || pathname.startsWith("/sprint/")) && effectiveProjectId != null && (
                <div className="mb-2">
                  <div className="px-2 py-1.5 text-[hsl(var(--sidebar-muted))] text-xs font-medium uppercase tracking-wider">
                    Current project
                  </div>
                  <NavLink to={`/project/${effectiveProjectId}?tab=sprints`} className={({ isActive }) => cn("flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors", isActive ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]" : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]")}>
                    <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                    Sprints
                  </NavLink>
                  <NavLink to={`/project/${effectiveProjectId}?tab=team`} className={({ isActive }) => cn("flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors", isActive ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]" : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]")}>
                    <Users className="h-4 w-4 flex-shrink-0" />
                    Team
                  </NavLink>
                </div>
              )}
              <div className="px-2 py-1.5 text-[hsl(var(--sidebar-muted))] text-xs font-medium uppercase tracking-wider">
                Menu
              </div>
              {globalNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]"
                        : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-2 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2 rounded px-2 py-2">
            <div className="h-7 w-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xs font-medium text-primary-foreground flex-shrink-0">
              {user?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[hsl(var(--sidebar-foreground))] truncate">{user?.full_name ?? "User"}</p>
              <p className="text-2xs text-[hsl(var(--sidebar-muted))] truncate capitalize">{user?.role ?? ""}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
