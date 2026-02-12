import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    useAllTasks,
    useDeleteTask,
    useTask,
    useUpdateTask,
    useUpdateTaskStatus,
    useUsers,
} from "@/hooks/useApiHooks";
import type { ApiTask, TaskStatus } from "@/types";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TASK_STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const Tasks = () => {
  const navigate = useNavigate();
  const { data: tasksRaw = [], isLoading: tasksLoading } = useAllTasks();
  const tasks = Array.isArray(tasksRaw) ? tasksRaw : [];
  const { data: usersRaw } = useUsers();
  const users = Array.isArray(usersRaw) ? usersRaw : [];
  const updateTask = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "ADMIN";

  const [viewTaskId, setViewTaskId] = useState<number | null>(null);
  const [editTaskItem, setEditTaskItem] = useState<ApiTask | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    assigned_to_user_id: 0 as number | undefined,
  });

  const { data: viewedTask } = useTask(viewTaskId ?? 0);

  const openEdit = (task: ApiTask) => {
    setTaskForm({
      title: task.title ?? "",
      description: task.description ?? "",
      status: (task.status ?? "TODO") as TaskStatus,
      assigned_to_user_id: task.assigned_to_user_id ?? undefined,
    });
    setEditTaskItem(task);
  };
  const openDelete = (taskId: number) => setDeleteTaskId(taskId);

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

  const handleStatusChange = async (taskId: number, status: TaskStatus) => {
    try {
      await updateStatus.mutateAsync({ taskId, status });
      toast({ title: "Status updated" });
    } catch (err) {
      toast({
        title: "Failed to update status",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
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

  const getUserName = (userId: number) => users.find((u) => u.user_id === userId)?.full_name ?? `User ${userId}`;

  if (tasksLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TaskDetailSheet
        task={viewTaskId != null ? (viewedTask ?? tasks.find((t) => t.task_id === viewTaskId)) ?? undefined : undefined}
        open={viewTaskId != null}
        onOpenChange={(open) => !open && setViewTaskId(null)}
        getUserName={getUserName}
        onEdit={(t) => { setViewTaskId(null); openEdit(t); }}
        onStatusChange={(taskId, status) => handleStatusChange(taskId, status)}
      />

      {/* Edit task */}
      <Dialog open={!!editTaskItem} onOpenChange={(open) => !open && setEditTaskItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update title, description, status, or assignee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tasks-edit-title">Title *</Label>
              <Input
                id="tasks-edit-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tasks-edit-desc">Description</Label>
              <Textarea
                id="tasks-edit-desc"
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tasks-edit-status">Status</Label>
              <select
                id="tasks-edit-status"
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
                <Label htmlFor="tasks-edit-assignee">Assign to</Label>
                <select
                  id="tasks-edit-assignee"
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
                    <option key={u.user_id} value={u.user_id}>{u.full_name} ({u.email})</option>
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

      {/* Delete confirmation */}
      <AlertDialog open={deleteTaskId != null} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>This task will be removed. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PageHeader
        title="Tasks"
        description={isAdmin ? "All tasks" : "Your assigned tasks"}
        breadcrumbs={[{ label: "Tasks" }]}
      />

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{isAdmin ? "No tasks yet." : "You have no assigned tasks."}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm data-table">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider text-xs w-24">Key</th>
                  <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider text-xs">Title</th>
                  <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                  <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider text-xs">Sprint</th>
                  <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider text-xs">Assignee</th>
                  <th className="text-left p-2 font-medium text-muted-foreground uppercase tracking-wider text-xs w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.task_id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => setViewTaskId(task.task_id)}>
                    <td className="p-2 font-mono text-xs text-muted-foreground">TASK-{task.task_id}</td>
                    <td className="p-2">
                      <span className="font-medium text-foreground">{task.title}</span>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{task.description}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary" className="text-2xs font-normal capitalize">{task.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={(e) => { e.stopPropagation(); navigate(`/sprint/${task.sprint_id}`); }}
                      >
                        Sprint {task.sprint_id}
                      </Button>
                    </td>
                    <td className="p-2 text-muted-foreground text-xs">{getUserName(task.assigned_to_user_id)}</td>
                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(task)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => openDelete(task.task_id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
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
