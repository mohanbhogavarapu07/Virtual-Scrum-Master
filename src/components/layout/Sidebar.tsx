import { LayoutDashboard, FolderKanban, BarChart3, Settings, Bot, Zap, Users, Calendar, ChevronDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const quickStats = [
  { label: "Active Sprints", value: "3" },
  { label: "Open Blockers", value: "2" },
  { label: "Team Velocity", value: "55" },
];

export const Sidebar = () => {
  const { projects, currentUser } = useApp();
  const activeProjects = projects.filter(p => p.status === "active");

  return (
    <div className="flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="p-1.5 rounded-md bg-primary">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">AI Scrum Master</span>
          <span className="text-2xs text-sidebar-muted">Enterprise</span>
        </div>
      </div>

      {/* Organization / Context Switcher */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-left">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xs font-bold text-white">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">Acme Corporation</p>
            <p className="text-2xs text-sidebar-muted truncate">3 projects · 24 members</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-sidebar-muted" />
        </button>
      </div>

      {/* Main Navigation */}
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

        {/* Projects Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-2xs font-medium text-sidebar-muted uppercase tracking-wider">Active Projects</span>
          </div>
          <div className="space-y-0.5">
            {activeProjects.map((project) => (
              <NavLink
                key={project.id}
                to={`/project/${project.id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  project.health === "healthy" ? "bg-success" :
                  project.health === "at-risk" ? "bg-warning" : "bg-destructive"
                )} />
                <span className="truncate">{project.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="grid grid-cols-3 gap-2">
          {quickStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-semibold text-sidebar-foreground">{stat.value}</p>
              <p className="text-2xs text-sidebar-muted leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-xs font-semibold text-white">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
            <p className="text-2xs text-sidebar-muted truncate capitalize">{currentUser.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
