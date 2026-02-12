import logo from "@/assets/logo.png";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useApiHooks";
import { cn } from "@/lib/utils";
import { Activity, BarChart3, ChevronDown, ChevronLeft, FolderKanban, LayoutDashboard, ListTodo, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
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
  const { data: projectsRaw = [] } = useProjects();
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];

  return (
    <>
      {/* Backdrop when sidebar is open (mobile / overlay) */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border shadow-lg transition-transform duration-200 ease-out md:relative md:z-auto md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-0"
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4 flex-shrink-0">
          <img src={logo} alt="Virtual Scrum Master" className="w-8 h-8 rounded-md flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-sidebar-foreground truncate">Virtual Scrum Master</span>
            <span className="text-2xs text-sidebar-muted">Enterprise</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
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
            onClick={onClose}
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
                onClick={onClose}
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
      </aside>
    </>
  );
};
