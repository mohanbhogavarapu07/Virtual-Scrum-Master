import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useApiHooks";
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

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onToggle, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { id: projectIdParam } = useParams();
  const projectId = projectIdParam ? Number(projectIdParam) : null;
  const { data: projectsRaw = [] } = useProjects();
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];

  const isProjectRoute = pathname.startsWith("/project/") && projectId;
  const projectNav = isProjectRoute
    ? [
        { name: "Overview", href: `/project/${projectId}`, icon: LayoutGrid },
        { name: "Backlog", href: `/project/${projectId}?tab=backlog`, icon: List },
        { name: "Board", href: `/project/${projectId}?tab=sprints`, icon: LayoutGrid },
        { name: "People", href: `/project/${projectId}?tab=people`, icon: Users },
      ]
    : [];

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

        <div className="px-2 py-2 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-md text-[hsl(var(--sidebar-muted))] text-xs font-medium uppercase tracking-wider">
            <span>Projects</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-0.5 mt-1">
            {projects.slice(0, 8).map((p) => (
              <NavLink
                key={p.project_id}
                to={`/project/${p.project_id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                    isActive
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
          {projectNav.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1.5 text-[hsl(var(--sidebar-muted))] text-xs font-medium uppercase tracking-wider">
                Current project
              </div>
              {projectNav.map((item) => (
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
