import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    useCreateTask,
    useDeleteSprint,
    useDeleteTask,
    useSprint,
    useSprintTasks,
    useUpdateSprint,
    useUpdateTask,
    useUpdateTaskStatus,
    useUsers,
} from "@/hooks/useApiHooks";
import { cn } from "@/lib/utils";
import { ApiTask, TaskStatus } from "@/types";
import { motion } from "framer-motion";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "TODO", title: "To Do", color: "bg-muted-foreground" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-primary" },
  { id: "DONE", title: "Done", color: "bg-success" },
];

const STATUS_OPTIONS = ["PLANNED", "ACTIVE", "COMPLETED"] as const;

const SprintBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sprintId = Number(id);
  const { data: sprint, isLoading: sprintLoading } = useSprint(sprintId);
  const { data: tasksRaw = [], isLoading: tasksLoading } = useSprintTasks(sprintId);
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const { data: usersRaw } = useUsers();
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const updateStatus = useUpdateTaskStatus();
  const updateSprint = useUpdateSprint();
  const deleteSprint = useDeleteSprint();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "ADMIN";
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    sprint_name: "",
    start_date: "",
    end_date: "",
    status: "PLANNED" as (typeof STATUS_OPTIONS)[number],
  });

  const TASK_STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [editTaskItem, setEditTaskItem] = useState<ApiTask | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    assigned_to_user_id: 0 as number | undefined,
  });

  const openCreateTask = () => {
    setTaskForm({
      title: "",
      description: "",
      status: "TODO",
      assigned_to_user_id: isAdmin ? undefined : user?.user_id ?? 0,
    });
    setTaskCreateOpen(true);
  };
  const openEditTask = (task: ApiTask) => {
    setTaskForm({
      title: task.title ?? "",
      description: task.description ?? "",
      status: (task.status ?? "TODO") as TaskStatus,
      assigned_to_user_id: task.assigned_to_user_id ?? undefined,
    });
    setEditTaskItem(task);
  };
  const openDeleteTask = (taskId: number) => setDeleteTaskId(taskId);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = taskForm.title.trim();
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    try {
      await createTask.mutateAsync({
        sprintId,
        data: {
          title,
          description: taskForm.description.trim() || undefined,
          status: taskForm.status,
          assigned_to_user_id: taskForm.assigned_to_user_id || undefined,
        },
      });
      toast({ title: "Task created" });
      setTaskCreateOpen(false);
      setTaskForm({ title: "", description: "", status: "TODO", assigned_to_user_id: undefined });
    } catch (err) {
      toast({
        title: "Failed to create task",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskItem) return;
    const title = taskForm.title.trim();
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    try {
      await updateTask.mutateAsync({
        taskId: editTaskItem.task_id,
        data: {
          title,
          description: taskForm.description.trim() || undefined,
          status: taskForm.status,
          assigned_to_user_id: taskForm.assigned_to_user_id || undefined,
        },
      });
      toast({ title: "Task updated" });
      setEditTaskItem(null);
    } catch (err) {
      toast({
        title: "Failed to update task",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (deleteTaskId == null) return;
    try {
      await deleteTask.mutateAsync(deleteTaskId);
      toast({ title: "Task deleted" });
      setDeleteTaskId(null);
    } catch (err) {
      toast({
        title: "Failed to delete task",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openEdit = () => {
    if (!sprint) return;
    setSprintForm({
      sprint_name: sprint.sprint_name ?? "",
      start_date: sprint.start_date ? sprint.start_date.slice(0, 10) : "",
      end_date: sprint.end_date ? sprint.end_date.slice(0, 10) : "",
      status: STATUS_OPTIONS.includes(sprint.status as (typeof STATUS_OPTIONS)[number])
        ? (sprint.status as (typeof STATUS_OPTIONS)[number])
        : "PLANNED",
    });
    setEditOpen(true);
  };

  const handleUpdateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint) return;
    const name = sprintForm.sprint_name.trim();
    if (!name) {
      toast({ title: "Sprint name is required", variant: "destructive" });
      return;
    }
    try {
      await updateSprint.mutateAsync({
        sprintId: sprint.sprint_id,
        data: {
          sprint_name: name,
          start_date: sprintForm.start_date || undefined,
          end_date: sprintForm.end_date || undefined,
          status: sprintForm.status,
        },
      });
      toast({ title: "Sprint updated" });
      setEditOpen(false);
    } catch (err) {
      toast({
        title: "Failed to update sprint",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSprint = async () => {
    if (!sprint) return;
    const projectId = sprint.project_id;
    try {
      await deleteSprint.mutateAsync(sprint.sprint_id);
      toast({ title: "Sprint deleted" });
      setDeleteOpen(false);
      navigate(`/project/${projectId}`);
    } catch (err) {
      toast({
        title: "Failed to delete sprint",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (sprintLoading || tasksLoading) {
    return <DashboardLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;
  }
  if (!sprint) {
    return <DashboardLayout><div className="flex items-center justify-center h-96"><div className="text-center"><h2 className="text-xl font-semibold mb-2">Sprint Not Found</h2><Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button></div></div></DashboardLayout>;
  }

  const groupedTasks = columns.reduce((acc, col) => { acc[col.id] = tasks.filter(t => t.status === col.id); return acc; }, {} as Record<TaskStatus, ApiTask[]>);
  const completedCount = groupedTasks["DONE"]?.length ?? 0;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <DashboardLayout>
      {/* Edit sprint dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sprint</DialogTitle>
            <DialogDescription>Update sprint name, dates, or status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSprint} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sb-sprint-name">Sprint name *</Label>
              <Input
                id="sb-sprint-name"
                value={sprintForm.sprint_name}
                onChange={(e) => setSprintForm((f) => ({ ...f, sprint_name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sb-sprint-start">Start date</Label>
                <Input
                  id="sb-sprint-start"
                  type="date"
                  value={sprintForm.start_date}
                  onChange={(e) => setSprintForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sb-sprint-end">End date</Label>
                <Input
                  id="sb-sprint-end"
                  type="date"
                  value={sprintForm.end_date}
                  onChange={(e) => setSprintForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sb-sprint-status">Status</Label>
              <select
                id="sb-sprint-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={sprintForm.status}
                onChange={(e) =>
                  setSprintForm((f) => ({ ...f, status: e.target.value as (typeof STATUS_OPTIONS)[number] }))
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateSprint.isPending}>
                {updateSprint.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete sprint confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sprint?</AlertDialogTitle>
            <AlertDialogDescription>
              This sprint and its tasks will be removed. You will be taken back to the project. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSprint}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSprint.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create task dialog */}
      <Dialog open={taskCreateOpen} onOpenChange={setTaskCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Create a new task in this sprint.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={taskForm.status}
                onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
              >
                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            {isAdmin && users.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assign to (user id)</Label>
                <select
                  id="task-assignee"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={taskForm.assigned_to_user_id ?? ""}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      assigned_to_user_id: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTaskCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createTask.isPending}>
                {createTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit task dialog */}
      <Dialog open={!!editTaskItem} onOpenChange={(open) => !open && setEditTaskItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update title, description, status, or assignee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-edit-title">Title *</Label>
              <Input
                id="task-edit-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-edit-desc">Description</Label>
              <Textarea
                id="task-edit-desc"
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-edit-status">Status</Label>
              <select
                id="task-edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={taskForm.status}
                onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
              >
                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            {isAdmin && users.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="task-edit-assignee">Assign to</Label>
                <select
                  id="task-edit-assignee"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={taskForm.assigned_to_user_id ?? ""}
                  onChange={(e) =>
                    setTaskForm((f) => ({
                      ...f,
                      assigned_to_user_id: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTaskItem(null)}>Cancel</Button>
              <Button type="submit" disabled={updateTask.isPending}>
                {updateTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete task confirmation */}
      <AlertDialog open={deleteTaskId != null} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>This task will be removed. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTaskConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4 h-full flex flex-col">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-3"><h1 className="text-xl font-semibold">{sprint.sprint_name}</h1><Badge className="text-2xs bg-primary/10 text-primary border-0 capitalize">{sprint.status}</Badge></div>
            <p className="text-sm text-muted-foreground">{new Date(sprint.start_date).toLocaleDateString()} — {new Date(sprint.end_date).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={openEdit}>
                  <Pencil className="w-4 h-4" /> Edit Sprint
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="w-4 h-4" /> Delete Sprint
                </Button>
              </>
            )}
            <Button size="sm" className="gap-1.5" onClick={openCreateTask} disabled={!isAdmin}> <Plus className="w-4 h-4" />Add Task</Button>
          </div>
        </motion.div>

        <div className="bg-card border border-border rounded-lg p-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sprint Progress</span>
            <span className="text-xs text-muted-foreground">{completedCount}/{totalCount} tasks</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} className="h-full bg-primary rounded-full" />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col bg-muted/30 rounded-lg overflow-hidden">
              <div className="px-3 py-2.5 border-b border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", column.color)} />
                  <span className="text-sm font-medium">{column.title}</span>
                  <Badge variant="secondary" className="text-2xs px-1.5">{groupedTasks[column.id]?.length || 0}</Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {groupedTasks[column.id]?.map((task) => (
                  <div key={task.task_id} className="bg-card border border-border rounded-md p-3 cursor-pointer hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem className="text-xs" onClick={() => openEditTask(task)}>
                            <Pencil className="w-3 h-3 mr-2" /> Edit
                          </DropdownMenuItem>
                          {columns.filter(c => c.id !== column.id).map(c => (
                            <DropdownMenuItem key={c.id} className="text-xs" onClick={() => updateStatus.mutate({ taskId: task.task_id, status: c.id })}>Move to {c.title}</DropdownMenuItem>
                          ))}
                          {isAdmin && (
                            <DropdownMenuItem className="text-xs text-destructive focus:text-destructive" onClick={() => openDeleteTask(task.task_id)}>
                              <Trash2 className="w-3 h-3 mr-2" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-2xs text-muted-foreground">{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full justify-start text-muted-foreground h-9 text-sm" onClick={openCreateTask} disabled={!isAdmin}><Plus className="w-4 h-4 mr-2" />Add task</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SprintBoard;
