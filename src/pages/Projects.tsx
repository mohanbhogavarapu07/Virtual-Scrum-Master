import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Users, 
  Calendar, 
  Search, 
  LayoutGrid, 
  List,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, tasks } = useApp();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => {
      const project = projects.find(p => p.id === projectId);
      return project?.sprints.some(s => s.id === t.sprintId);
    });
    
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === "done").length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(t => {
      const project = projects.find(p => p.id === projectId);
      return project?.sprints.some(s => s.id === t.sprintId);
    });
  };

  const getHealthIcon = (health?: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case "at-risk":
        return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
      case "critical":
        return <AlertTriangle className="w-3.5 h-3.5 text-destructive" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getHealthBadge = (health?: string) => {
    switch (health) {
      case "healthy":
        return <Badge className="text-2xs bg-success/10 text-success border-success/20 hover:bg-success/20">Healthy</Badge>;
      case "at-risk":
        return <Badge className="text-2xs bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">At Risk</Badge>;
      case "critical":
        return <Badge className="text-2xs bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Critical</Badge>;
      default:
        return <Badge variant="outline" className="text-2xs">Planning</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="text-2xs bg-primary/10 text-primary border-0">Active</Badge>;
      case "planning":
        return <Badge variant="outline" className="text-2xs">Planning</Badge>;
      case "completed":
        return <Badge className="text-2xs bg-success/10 text-success border-0">Completed</Badge>;
      case "on-hold":
        return <Badge className="text-2xs bg-muted text-muted-foreground border-0">On Hold</Badge>;
      default:
        return null;
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">{projects.length} projects · {projects.filter(p => p.status === "active").length} active</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </motion.div>

        {/* Filters & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Projects Grid/List */}
        {viewMode === "grid" ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProjects.map((project, index) => {
              const progress = getProjectProgress(project.id);
              const projectTasks = getProjectTasks(project.id);
              const activeSprint = project.sprints.find(s => s.status === "active");
              
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -2 }}
                  className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getHealthIcon(project.health)}
                        <h3 className="text-sm font-semibold truncate">{project.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(project.status)}
                    {getHealthBadge(project.health)}
                  </div>

                  {/* Progress */}
                  {progress > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xs text-muted-foreground">Progress</span>
                        <span className="text-2xs font-medium">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                    <div className="text-center">
                      <p className="text-sm font-semibold">{project.teamMembers.length}</p>
                      <p className="text-2xs text-muted-foreground">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{project.sprints.length}</p>
                      <p className="text-2xs text-muted-foreground">Sprints</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{projectTasks.length}</p>
                      <p className="text-2xs text-muted-foreground">Tasks</p>
                    </div>
                  </div>

                  {/* Active Sprint */}
                  {activeSprint && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-muted-foreground">{activeSprint.name}</span>
                        <span className="text-2xs text-muted-foreground ml-auto">{activeSprint.velocity} pts</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Progress</th>
                  <th>Team</th>
                  <th>Active Sprint</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const progress = getProjectProgress(project.id);
                  const activeSprint = project.sprints.find(s => s.status === "active");

                  return (
                    <tr 
                      key={project.id} 
                      className="cursor-pointer"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          {getHealthIcon(project.health)}
                          <div>
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.owner}</p>
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(project.status)}</td>
                      <td>{getHealthBadge(project.health)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs">{progress}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">{project.teamMembers.length}</span>
                        </div>
                      </td>
                      <td>
                        {activeSprint ? (
                          <span className="text-sm">{activeSprint.name}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
