import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreateProject, useProjects } from "@/hooks/useApiHooks";
import { motion } from "framer-motion";
import { ChevronRight, LayoutGrid, List, Loader2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = projectName.trim();
    if (!name) {
      toast({ title: "Project name is required", variant: "destructive" });
      return;
    }
    try {
      await createProject.mutateAsync({
        project_name: name,
        ...(description.trim() && { description: description.trim() }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });
      toast({ title: "Project created" });
      setDialogOpen(false);
      setProjectName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      toast({
        title: "Failed to create project",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const filteredProjects = projects.filter(p =>
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <DashboardLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Create a new project. Only project name is required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project name *</Label>
              <Input
                id="project_name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Q1 Release"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description (optional)"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">{projects.length} projects</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => isAdmin && setDialogOpen(true)} disabled={!isAdmin}>
            <Plus className="w-4 h-4" />New Project
          </Button>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-8 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center border rounded-md">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setViewMode("grid")}><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.div key={project.project_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }} whileHover={{ y: -2 }}
                className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(`/project/${project.project_id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{project.project_name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                  <div><p className="text-2xs text-muted-foreground">Start</p><p className="text-xs font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"}</p></div>
                  <div><p className="text-2xs text-muted-foreground">End</p><p className="text-xs font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Project</th><th>Start</th><th>End</th><th></th></tr></thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.project_id} className="cursor-pointer" onClick={() => navigate(`/project/${project.project_id}`)}>
                    <td><p className="font-medium text-sm">{project.project_name}</p><p className="text-xs text-muted-foreground">{project.description}</p></td>
                    <td className="text-sm">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"}</td>
                    <td className="text-sm">{project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"}</td>
                    <td><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredProjects.length === 0 && <div className="text-center py-12 text-muted-foreground"><p>No projects found</p></div>}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
