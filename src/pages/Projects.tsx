import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/page-loading";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from "@/hooks/useApiHooks";
import type { ApiProject } from "@/types";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, ChevronRight, FolderKanban, LayoutGrid, List, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const emptyForm = () => ({ project_name: "", description: "", start_date: "", end_date: "", created_by_admin_id: 0 });
const projectToForm = (p: ApiProject) => ({ project_name: p.project_name ?? "", description: p.description ?? "", start_date: p.start_date ? p.start_date.slice(0, 10) : "", end_date: p.end_date ? p.end_date.slice(0, 10) : "", created_by_admin_id: p.created_by_admin_id ?? 0 });

const Projects = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: projectsRaw = [], isLoading, isError, error, refetch } = useProjects();
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<ApiProject | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const isAdmin = user?.role === "ADMIN";
  const adminId = user?.user_id ?? 0;

  const openCreate = () => { setForm({ ...emptyForm(), created_by_admin_id: adminId }); setCreateOpen(true); };

  useEffect(() => {
    if (searchParams.get("openCreate") === "1" && isAdmin) {
      setSearchParams((p) => { const next = new URLSearchParams(p); next.delete("openCreate"); return next; }, { replace: true });
      setForm({ ...emptyForm(), created_by_admin_id: adminId }); setCreateOpen(true);
    }
  }, [searchParams.get("openCreate"), isAdmin, adminId]);

  const openEdit = (e: React.MouseEvent, project: ApiProject) => { e.stopPropagation(); setForm(projectToForm(project)); setEditProject(project); };
  const openDelete = (e: React.MouseEvent, projectId: number) => { e.stopPropagation(); setDeleteProjectId(projectId); };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.project_name.trim();
    if (!name) { toast({ title: "Project name is required", variant: "destructive" }); return; }
    try {
      await createProject.mutateAsync({ project_name: name, created_by_admin_id: form.created_by_admin_id || adminId, ...(form.description.trim() && { description: form.description.trim() }), ...(form.start_date && { start_date: form.start_date }), ...(form.end_date && { end_date: form.end_date }) });
      toast({ title: "Project created" }); setCreateOpen(false); setForm(emptyForm());
    } catch (err) { toast({ title: "Failed to create project", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" }); }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProject) return;
    const name = form.project_name.trim();
    if (!name) { toast({ title: "Project name is required", variant: "destructive" }); return; }
    try {
      await updateProject.mutateAsync({ projectId: editProject.project_id, data: { project_name: name, ...(form.description !== undefined && { description: form.description.trim() }), ...(form.start_date && { start_date: form.start_date }), ...(form.end_date && { end_date: form.end_date }) } });
      toast({ title: "Project updated" }); setEditProject(null); setForm(emptyForm());
    } catch (err) { toast({ title: "Failed to update project", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" }); }
  };

  const handleDeleteConfirm = async () => {
    if (deleteProjectId == null) return;
    try { await deleteProject.mutateAsync(deleteProjectId); toast({ title: "Project deleted" }); setDeleteProjectId(null); }
    catch (err) { toast({ title: "Failed to delete project", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" }); }
  };

  const filteredProjects = projects.filter((p) => p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()));

  const projectForm = (
    <>
      <div className="space-y-2">
        <Label htmlFor="project_name">Project name *</Label>
        <Input id="project_name" value={form.project_name} onChange={(e) => setForm((f) => ({ ...f, project_name: e.target.value }))} placeholder="e.g. Q1 Release" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief description (optional)" rows={2} />
      </div>
      {!editProject && (
        <div className="space-y-2">
          <Label htmlFor="created_by_admin_id">Created by admin ID</Label>
          <Input id="created_by_admin_id" type="number" min={0} value={form.created_by_admin_id || ""} onChange={(e) => setForm((f) => ({ ...f, created_by_admin_id: parseInt(e.target.value, 10) || 0 }))} placeholder={String(adminId)} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label htmlFor="start_date">Start date</Label><Input id="start_date" type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} /></div>
        <div className="space-y-2"><Label htmlFor="end_date">End date</Label><Input id="end_date" type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} /></div>
      </div>
    </>
  );

  if (isLoading) return <PageLoading />;

  return (
    <DashboardLayout>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>New Project</DialogTitle><DialogDescription>Create a new project.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">{projectForm}<DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" disabled={createProject.isPending}>{createProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}</Button></DialogFooter></form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Project</DialogTitle><DialogDescription>Update project details.</DialogDescription></DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">{projectForm}<DialogFooter><Button type="button" variant="outline" onClick={() => setEditProject(null)}>Cancel</Button><Button type="submit" disabled={updateProject.isPending}>{updateProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}</Button></DialogFooter></form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteProjectId != null} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete project?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {isError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-3">
            <span>Failed to load projects. {error instanceof Error ? error.message : "Check your connection."}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </div>
        )}
        <PageHeader
          title="Projects"
          description={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          breadcrumbs={[{ label: "Projects" }]}
          actions={isAdmin ? <Button size="sm" className="gap-1.5" onClick={openCreate}><Plus className="w-4 h-4" /> New Project</Button> : undefined}
        />

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-8 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center border border-border rounded-lg">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setViewMode("grid")}><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects found" description={searchQuery ? "Try a different search term" : isAdmin ? "Create your first project to get started" : "No projects assigned to you yet"}>
            {isAdmin && !searchQuery && <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" />New Project</Button>}
          </EmptyState>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.div key={project.project_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * index }}
                className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-[hsl(var(--primary)/0.3)] transition-all group"
                onClick={() => navigate(`/project/${project.project_id}`)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                        <FolderKanban className="w-4 h-4 text-[hsl(var(--primary))]" />
                      </div>
                      <h3 className="text-sm font-semibold truncate">{project.project_name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 ml-10">{project.description || "No description"}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => openEdit(e, project)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => openDelete(e, project.project_id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"}</div>
                  <ArrowRight className="w-3 h-3" />
                  <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Project</th><th>Start</th><th>End</th>{isAdmin && <th className="w-24">Actions</th>}<th className="w-8"></th></tr></thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.project_id} className="cursor-pointer" onClick={() => navigate(`/project/${project.project_id}`)}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0"><FolderKanban className="w-4 h-4 text-[hsl(var(--primary))]" /></div>
                        <div><p className="font-medium text-sm">{project.project_name}</p><p className="text-xs text-muted-foreground truncate max-w-xs">{project.description}</p></div>
                      </div>
                    </td>
                    <td className="text-sm">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"}</td>
                    <td className="text-sm">{project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"}</td>
                    {isAdmin && (
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => openEdit(e, project)}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => openDelete(e, project.project_id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    )}
                    <td><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
