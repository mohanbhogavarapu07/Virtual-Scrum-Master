import { LayoutDashboard, FolderKanban, BarChart3, Settings, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useApiHooks";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();

  return (
    <div className="flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src={logo} alt="Virtual Scrum Master" className="w-8 h-8 rounded-md" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Virtual Scrum Master</span>
          <span className="text-2xs text-sidebar-muted">Enterprise</span>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-left">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xs font-bold text-white">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">Acme Corporation</p>
            <p className="text-2xs text-sidebar-muted truncate">{projects.length} projects</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-sidebar-muted" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}

        <div className="pt-4">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-2xs font-medium text-sidebar-muted uppercase tracking-wider">Projects</span>
          </div>
          <div className="space-y-0.5">
            {projects.map((project) => (
              <NavLink
                key={project.project_id}
                to={`/project/${project.project_id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="truncate">{project.project_name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-xs font-semibold text-white">
            {user?.full_name?.split(' ').map(n => n[0]).join('') ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.full_name ?? 'User'}</p>
            <p className="text-2xs text-sidebar-muted truncate capitalize">{user?.role ?? ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
