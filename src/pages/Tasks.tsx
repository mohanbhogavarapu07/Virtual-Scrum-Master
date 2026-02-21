import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/page-loading";
import { StatusBadge } from "@/components/ui/status-badge";
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
import {
  useAllTasks, useCreateTask, useDeleteTask, useProject, useProjectSprints, useProjects,
  useTask, useUpdateTask, useUpdateTaskStatus, useUsers,
} from "@/hooks/useApiHooks";
import type { ApiTask, TaskStatus } from "@/types";
import { ListTodo, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const TASK_STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const Tasks = () => {
  const navigate = useNavigate();
  const { id: projectIdParam } = useParams();
  const projectId = projectIdParam ? Number(projectIdParam) : null;
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: tasksRaw = [], isLoading: tasksLoading } = useAllTasks();
  const allTasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const { data: usersRaw } = useUsers();
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const { data: projectsRaw = [] } = useProjects();
  const projects = Array.isArray(projectsRaw) ? projectsRaw : [];
  const { data: projectScopedSprintsRaw = [] } = useProjectSprints(projectId ?? 0);
  const projectScopedSprints = Array.isArray(projectScopedSprintsRaw) ? projectScopedSprintsRaw : [];
  const projectSprintIds = useMemo(() => projectScopedSprints.map((s) => s.sprint_id), [projectScopedSprints]);
  const tasks = useMemo(() => {
    if (projectId != null) {
      return allTasks.filter((t) => projectSprintIds.includes(t.sprint_id));
    }
    return allTasks;
  }, [allTasks, projectId, projectSprintIds]);
  const [viewTaskId, setViewTaskId] = useState<number | null>(null);
  const [editTaskItem, setEditTaskItem] = useState<ApiTask | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [createForm, setCreateForm] = useState({ projectId: null as number | null, sprintId: null as number | null, title: "", description: "", status: "TODO" as TaskStatus, assigned_to_user_id: undefined as number | undefined });
  const { data: sprintsRaw = [] } = useProjectSprints(createForm.projectId ?? projectId ?? 0);
  const sprints = Array.isArray(sprintsRaw) ? sprintsRaw : [];
  const { data: project } = useProject(projectId ?? 0);
  const updateTask = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "ADMIN";
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "TODO" as TaskStatus, assigned_to_user_id: 0 as number | undefined });
  const { data: viewedTask } = useTask(viewTaskId ?? 0);

  useEffect(() => {
    if (searchParams.get("openCreate") === "1") {
      setSearchParams((p) => { const next = new URLSearchParams(p); next.delete("openCreate"); return next; }, { replace: true });
      setCreateForm({ projectId: projectId ?? null, sprintId: null, title: "", description: "", status: "TODO", assigned_to_user_id: isAdmin ? undefined : user?.user_id }); setCreateOpen(true);
    }
  }, [searchParams.get("openCreate"), isAdmin, user?.user_id, projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.sprintId) { toast({ title: "Select a project and sprint", variant: "destructive" }); return; }
    const title = createForm.title.trim();
    if (!title) { toast({ title: "Title is required", variant: "destructive" }); return; }
    try {
      await createTask.mutateAsync({ sprintId: createForm.sprintId, data: { title, description: createForm.description.trim() || undefined, status: createForm.status, assigned_to_user_id: createForm.assigned_to_user_id || undefined } });
      toast({ title: "Task created" });
      setCreateOpen(false);
      setCreateForm((prev) => ({ ...prev, projectId: projectId ?? prev.projectId, sprintId: null, title: "", description: "", status: "TODO", assigned_to_user_id: undefined }));
    } catch (err) { toast({ title: "Failed to create task", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" }); }
  };

  const openEdit = (task: ApiTask) => { setTaskForm({ title: task.title ?? "", description: task.description ?? "", status: (task.status ?? "TODO") as TaskStatus, assigned_to_user_id: task.assigned_to_user_id ?? undefined }); setEditTaskItem(task); };
  const openDelete = (taskId: number) => setDeleteTaskId(taskId);

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskItem) return;
    const title = taskForm.title.trim();
    if (!title) { toast({ title: "Title is required", variant: "destructive" }); return; }
    try {
      await updateTask.mutateAsync({ taskId: editTaskItem.task_id, data: { title, description: taskForm.description.trim() || undefined, status: taskForm.status, assigned_to_user_id: taskForm.assigned_to_user_id || undefined } });
      toast({ title: "Task updated" }); setEditTaskItem(null);
    } catch (err) { toast({ title: "Failed to update task", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" }); }
  };

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    try { await updateStatus.mutateAsync({ taskId, status }); toast({ title: "Status updated" }); }
    catch (err) { toast({ title: "Failed to update status", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" }); }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTaskId == null) return;
    try { await deleteTask.mutateAsync(deleteTaskId); toast({ title: "Task deleted" }); setDeleteTaskId(null); }
    catch (err) { toast({ title: "Failed to delete task", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" }); }
  };

  const getUserName = (userId: number) => users.find((u) => u.user_id === userId)?.full_name ?? `User ${userId}`;

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterStatus !== "ALL") result = result.filter(t => t.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, filterStatus, searchQuery]);

  if (tasksLoading) return <PageLoading />;

  return (
    <DashboardLayout>
      <TaskDetailSheet task={viewTaskId != null ? (viewedTask ?? tasks.find((t) => t.task_id === viewTaskId)) ?? undefined : undefined} open={viewTaskId != null} onOpenChange={(open) => !open && setViewTaskId(null)} getUserName={getUserName} onEdit={(t) => { setViewTaskId(null); openEdit(t); }} onStatusChange={(taskId, status) => handleStatusChange(taskId, status)} />
      <Dialog open={!!editTaskItem} onOpenChange={(open) => !open && setEditTaskItem(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Edit Task</DialogTitle><DialogDescription>Update task details.</DialogDescription></DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="space-y-2"><Label>Status</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={taskForm.status} onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}>{TASK_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
            {isAdmin && users.length > 0 && <div className="space-y-2"><Label>Assignee</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={taskForm.assigned_to_user_id ?? ""} onChange={(e) => setTaskForm((f) => ({ ...f, assigned_to_user_id: e.target.value ? Number(e.target.value) : undefined }))}><option value="">Unassigned</option>{users.map((u) => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}</select></div>}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEditTaskItem(null)}>Cancel</Button><Button type="submit" disabled={updateTask.isPending}>{updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteTaskId != null} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete task?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>New Task</DialogTitle><DialogDescription>Select project, sprint, then fill details.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2"><Label>Project *</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={createForm.projectId ?? ""} onChange={(e) => { const id = e.target.value ? Number(e.target.value) : null; setCreateForm((f) => ({ ...f, projectId: id, sprintId: null })); }} required><option value="">Select project</option>{projects.map((p) => <option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}</select></div>
            <div className="space-y-2"><Label>Sprint *</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={createForm.sprintId ?? ""} onChange={(e) => setCreateForm((f) => ({ ...f, sprintId: e.target.value ? Number(e.target.value) : null }))} required disabled={!createForm.projectId}><option value="">Select sprint</option>{sprints.map((s) => <option key={s.sprint_id} value={s.sprint_id}>{s.sprint_name ?? `Sprint ${s.sprint_id}`}</option>)}</select></div>
            <div className="space-y-2"><Label>Title *</Label><Input value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="space-y-2"><Label>Status</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={createForm.status} onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}>{TASK_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
            {isAdmin && users.length > 0 && <div className="space-y-2"><Label>Assignee</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={createForm.assigned_to_user_id ?? ""} onChange={(e) => setCreateForm((f) => ({ ...f, assigned_to_user_id: e.target.value ? Number(e.target.value) : undefined }))}><option value="">Unassigned</option>{users.map((u) => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}</select></div>}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" disabled={createTask.isPending}>{createTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <PageHeader
          title="Tasks"
          description={projectId ? `${tasks.length} tasks in this project` : isAdmin ? `${tasks.length} total tasks` : "Your assigned tasks"}
          breadcrumbs={projectId ? [{ label: "Projects", href: "/projects" }, { label: project?.project_name ?? "Project", href: `/project/${projectId}` }, { label: "Tasks" }] : [{ label: "Tasks" }]}
          actions={isAdmin ? <Button size="sm" className="gap-1.5" onClick={() => { setCreateForm((f) => ({ ...f, projectId: projectId ?? f.projectId, sprintId: null })); setCreateOpen(true); }}><Plus className="w-4 h-4" /> New Task</Button> : undefined}
        />

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-8 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-1.5">
            {["ALL", ...TASK_STATUS_OPTIONS].map(s => (
              <Button key={s} variant={filterStatus === s ? "secondary" : "ghost"} size="sm" className="h-8 text-xs"
                onClick={() => setFilterStatus(s)}
              >
                {s === "ALL" ? "All" : s.replace("_", " ")}
                {s !== "ALL" && <span className="ml-1 text-muted-foreground">({tasks.filter(t => t.status === s).length})</span>}
              </Button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <EmptyState icon={ListTodo} title="No tasks found" description={searchQuery || filterStatus !== "ALL" ? "Try adjusting your filters" : isAdmin ? "Create your first task" : "No tasks assigned to you"} />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm data-table">
              <thead>
                <tr>
                  <th className="w-24">Key</th>
                  <th>Title</th>
                  <th className="w-32">Status</th>
                  <th className="w-24">Sprint</th>
                  <th>Assignee</th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.task_id} className="cursor-pointer" onClick={() => setViewTaskId(task.task_id)}>
                    <td className="font-mono text-xs text-muted-foreground">TASK-{task.task_id}</td>
                    <td>
                      <span className="font-medium text-foreground">{task.title}</span>
                      {task.description && <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{task.description}</p>}
                    </td>
                    <td><StatusBadge status={task.status} /></td>
                    <td>
                      <Button variant="link" className="h-auto p-0 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/sprint/${task.sprint_id}`); }}>Sprint {task.sprint_id}</Button>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-2xs font-medium text-[hsl(var(--primary))]">
                          {getUserName(task.assigned_to_user_id).split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-xs text-muted-foreground">{getUserName(task.assigned_to_user_id)}</span>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(task)}><Pencil className="w-3.5 h-3.5" /></Button>
                        {isAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => openDelete(task.task_id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                      </div>
                    </td>
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

export default Tasks;
